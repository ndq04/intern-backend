const AppError = require("../utils/appError");
const conn = require("../services/db");
const { formatDate, NOW } = require("../utils/common");

exports.getAllHeading = (req, res, next) => {

  let conditions = '';
  const {
    slipNumber_from,
    slipNumber_to,
    slipDate_from,
    slipDate_to,
    startDate,
    endDate,
    accountingMethod1,
    accountingMethod2
  } = req.query;

  if(slipNumber_from && slipNumber_to) {
    conditions += `AND h.DENPYONO BETWEEN ${slipNumber_from} AND ${slipNumber_to} `;
  } else if(slipNumber_from && !slipNumber_to) {
    conditions += `AND h.DENPYONO = ${slipNumber_from} `;
  } else if(!slipNumber_from && slipNumber_to) {
    conditions += `AND h.DENPYONO = ${slipNumber_to} `;
  } 

  if(accountingMethod1 && accountingMethod2) {
    conditions += `AND (h.SUITOKB = '${accountingMethod1}' OR h.SUITOKB = '${accountingMethod2}') `;
  } else if(accountingMethod1 && !accountingMethod2) {
    conditions += `AND h.SUITOKB = '${accountingMethod1}' `;
  } else if(!accountingMethod1 && accountingMethod2) {
    conditions += `AND h.SUITOKB = '${accountingMethod2}' `;
  }

  if(slipDate_from && slipDate_to) {
    conditions += `AND h.DENPYODT BETWEEN '${formatDate(slipDate_from)}' AND '${formatDate(slipDate_to)}' `;
  } else if(slipDate_from && !slipDate_to) {
    conditions += `AND h.DENPYODT = '${formatDate(slipDate_from)}' `;
  } else if(!slipDate_from && slipDate_to) {
    conditions += `AND h.DENPYODT = '${formatDate(slipDate_to)}' `;
  }

  if(startDate && endDate) {
    conditions += `AND h.UKETUKEDT BETWEEN '${formatDate(startDate)}' AND '${formatDate(endDate)}' `;
  } else if(startDate && !endDate) {
    conditions += `AND h.UKETUKEDT = '${formatDate(startDate)}' `;
  } else if(!startDate && endDate) {
    conditions += `AND h.UKETUKEDT = '${formatDate(endDate)}' `;
  }

  let query = `
    SELECT
      h.DENPYONO,
      h.BUMONCD_YKANR,
      d.BUMONNM,
      h.DENPYODT,
      h.UKETUKEDT,
      h.SUITOKB,
      h.BIKO,
      h.KINGAKU,
      h.SHIHARAIDT
    FROM heading h
    INNER JOIN department d ON d.BUMONCD = h.BUMONCD_YKANR
    WHERE TRUE ${conditions}
    ORDER BY h.DENPYONO
  `;

  conn.query(query, function (err, data, fields) {
    if(err) return next(new AppError(err));
    res.status(200).json(data);
  });
 };

 exports.getDepartment = (req, res, next) => {
  let conditions = '';

  const {
    departmentCode,
    departmentName
  } = req.query;

  if(departmentCode) {
    conditions += `AND d.BUMONCD = ${departmentCode} `;
  }
  if(departmentName) {
    conditions += `AND d.BUMONNM like '%${departmentName}%' `;
  }

  let query = `
    SELECT
      d.*
    FROM department d
    WHERE TRUE ${conditions}
  `;
  conn.query(query, function (err, data, fields) {
    if(err) return next(new AppError(err))
    res.status(200).json(data);
  });
 };

exports.getDetail = (req, res, next) => {
  const query = `
    SELECT
      d.GYONO,
      d.DENPYONO,
      d.IDODT,
      d.SHUPPATSUPLC,
      d.MOKUTEKIPLC,
      d.KEIRO,
      d.KINGAKU,
      d.CHECKDELETE
    FROM detail d
    WHERE d.DENPYONO = ${req.query.id}
  `;
  conn.query(query, function (err, data, fields) {
    if(err) return next(new AppError(err))
    res.status(200).json(data);
  });
 };

exports.addScheduled = (req, res, next) => {
  if (!req.body) return next(new AppError("No form data found", 404));
  const input = {
    ...req.body,
    paymentDueDate: formatDate(req.body.paymentDueDate),
    applicationDate: formatDate(req.body.applicationDate)
  }

  const query = `
    INSERT INTO heading (DENPYODT, SUITOKB, SHIHARAIDT, KAIKEIND, UKETUKEDT, BUMONCD_YKANR, BIKO, INSERT_DATE, INSERT_PGM_ID, INSERT_PGM_PRM, UPDATE_PGM_ID, UPDATE_PGM_PRM) 
    VALUES (
      '${input.slipDate}',
      '${input.accountingMethod}',
      '${input.paymentDueDate}',
      '${input.year}',
      '${input.applicationDate}',
      '${input.departmentCode}',
      '${input.comment}',
       ${NOW},
      'AWCYO26001',
      '00000',
      'AWCYO26001',
      '00000'
    )
  `
  conn.query(
    query,
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        result: data,
        message: "success",
      });
    }
  );
 };

exports.updateScheduled = (req, res, next) => {
  if (!req.body) return next(new AppError("No form data found", 404));
  const input = {
    ...req.body,
    paymentDueDate: formatDate(req.body.paymentDueDate),
    applicationDate: formatDate(req.body.applicationDate)
  }
  const query = `
    UPDATE heading
    SET SUITOKB = '${input.accountingMethod}',
      SHIHARAIDT = '${input.paymentDueDate}',
      UKETUKEDT = '${input.applicationDate}',
      BUMONCD_YKANR = '${input.departmentCode}',
      BIKO = '${input.comment}',
      UPDATE_DATE = ${NOW}
    WHERE DENPYONO = ${input.slipNumber}
  `;
  conn.query(
    query,
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        result: data,
        message: "success",
      });
    }
  );
 };

exports.deleteScheduled = (req, res, next) => {
  const id = req.body.id;
  conn.query("DELETE FROM detail WHERE DENPYONO=?", [id]);
  conn.query(
    "DELETE FROM heading WHERE DENPYONO=?",
    [id],
    function (err, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        message: "success",
      });
    }
  );
 };

exports.addDetail = (req, res, next) => {
  if (!req.body) return next(new AppError("No form data found", 404));
  const input = [...req.body].map(item => ({
    ...item,
    CHECKDELETE: item.CHECKDELETE === false ? '0' : '1'
  }));

  let query = `INSERT INTO detail (DENPYONO, IDODT, SHUPPATSUPLC, MOKUTEKIPLC, KEIRO, KINGAKU, CHECKDELETE) VALUES
  `;
  
  query += ' (';
  for(let i=0; i<input.length; i++) {
    if(i > 0){
      query += `), (`;
    } 
    query += `${input[i].DENPYONO}, '${input[i].IDODT}', '${input[i].SHUPPATSUPLC}', '${input[i].MOKUTEKIPLC}', '${input[i].KEIRO}', ${input[i].KINGAKU}, ${input[i].CHECKDELETE}`;
  }
  query += ')';
  conn.query(
    query,
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        result: data,
        message: "success",
      });
    }
  );
};

exports.updateDetail = (req, res, next) => {
  if (!req.body) return next(new AppError("No form data found", 404));
  const input = {
    ...req.body,
    CHECKDELETE: req.body.CHECKDELETE === false ? '0' : '1'
  };

  const query = `
    UPDATE detail
    SET IDODT = '${input.IDODT}',
        SHUPPATSUPLC = '${input.SHUPPATSUPLC}',
        MOKUTEKIPLC = '${input.MOKUTEKIPLC}',
        KEIRO = '${input.KEIRO}',
        KINGAKU = '${input.KINGAKU}',
        CHECKDELETE = '${input.CHECKDELETE}',
        UPDATE_DATE = ${NOW}
    WHERE GYONO = ${input.GYONO};`;

  conn.query(
    query,
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        result: data,
        message: "success",
      });
    }
  );
};

exports.deleteDetail = (req, res, next) => {
  const input = {...req.body};
  const query = `DELETE FROM detail WHERE GYONO = ${input.GYONO};`;
  conn.query(
    query,
    function (err, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        message: "success",
      });
    }
  );
 };