const AppError = require("../utils/appError");
const conn = require("../services/db");
const { formatDate } = require("../utils/common");

exports.getAllHeading = (req, res, next) => {
  const query = `
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
    ORDER BY h.DENPYONO
  `;
  conn.query(query, function (err, data, fields) {
    if(err) return next(new AppError(err))
    res.status(200).json(data);
  });
 };

exports.getDepartment = (req, res, next) => {
  const query = `
    SELECT
      d.*
    FROM department d
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
      d.KINGAKU
    FROM detail d
    WHERE d.DENPYONO = ${req.body.id}
  `;
  conn.query(query, function (err, data, fields) {
    if(err) return next(new AppError(err))
    res.status(200).json(data);
  });
 };

exports.searchDepartment = (req, res, next) => {
  let conditions = '';

  const {
    departmentCode,
    departmentName
  } = req.body;

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

exports.searchHeading = (req, res, next) => {

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
  } = req.body;

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

exports.addScheduled = (req, res, next) => {
  if (!req.body) return next(new AppError("No form data found", 404));
  const input = {
    ...req.body,
    paymentDueDate: formatDate(req.body.paymentDueDate),
    applicationDateDate: formatDate(req.body.applicationDateDate)
  }

  const query = `
    INSERT INTO heading (DENPYODT, SUITOKB, SHIHARAIDT, KAIKEIND, UKETUKEDT, BUMONCD_YKANR, BIKO) 
    VALUES (
      '${input.slipDate}',
      '${input.accountingMethod}',
      '${input.paymentDueDate}',
      '${input.year}',
      '${input.applicationDateDate}',
      '${input.departmentCode}',
      '${input.comment}'
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
    applicationDateDate: formatDate(req.body.applicationDateDate)
  }
  const query = `
    UPDATE heading
    SET SUITOKB = '${input.accountingMethod}',
      SHIHARAIDT = '${input.paymentDueDate}',
      UKETUKEDT = '${input.applicationDateDate}',
      BUMONCD_YKANR = '${input.departmentCode}',
      BIKO = '${input.comment}'
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
  conn.query("DELETE FROM detail WHERE DENPYONO=?", [req.body.id]);
  conn.query(
    "DELETE FROM heading WHERE DENPYONO=?",
    [req.body.id],
    function (err, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        message: "success",
      });
    }
  );
 };