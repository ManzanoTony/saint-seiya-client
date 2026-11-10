export async function requestApi(url, options = {}, fallbackMessage = "The request failed.") {
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new Error(`Could not connect to the server: ${error.message}`);
  }

  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      if (response.ok) {
        throw new Error("The server returned an invalid response.");
      }
      data = { error: responseText };
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || `${fallbackMessage} (HTTP ${response.status}).`);
  }

  return data;
}
