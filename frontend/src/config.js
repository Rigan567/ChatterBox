export const apiUrl = process.env.REACT_APP_API_URL;

if (!apiUrl) {
  console.error(
    "REACT_APP_API_URL is not defined in the environment variables"
  );
}
