const adjust = (n) => (n < 10 ? `0${n}` : n);
exports.formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getFullYear()}-${adjust(d.getMonth() + 1)}-${adjust(d.getDate())}`;
};

exports.NOW = `localtimestamp`;