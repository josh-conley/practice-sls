export const createResponse = (status, data) => {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: data,
  };
};
