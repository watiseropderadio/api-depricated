export default async function addCopyright(request, response, payload) {
  const { action } = request;

  if (payload && action !== 'preflight') {
    return {
      ...payload,
      meta: {
        owner: 'Adriaan van Rossum',
        copyright: `${new Date().getFullYear()} (c) watiseropderadio.nl`,
        contact: 'data' + '@' + 'watiseropderadio' + '.' + 'nl'
      }
    };
  }

  return payload;
}
