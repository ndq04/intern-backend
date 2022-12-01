export function setUnknown(req, error) {
  req.apiUnknownErrors = error;
}

export function sendResultToClient(res, status, result = null) {
  try {
    res.status(status).send(result);
  } catch (exc) { // Empty
  }
}