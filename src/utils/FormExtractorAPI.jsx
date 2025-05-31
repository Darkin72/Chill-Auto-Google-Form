// api endpoint
const api_endpoint = "http://localhost:8000/submit-link";

// Handle form submission
export default async function apiRequest(link) {
  try {
    const response = await fetch(api_endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: link }),
    });
    if (response.ok) {
      const data = await response.json();
      console.log("Form submitted successfully:", data);
      return data;
    } else {
      console.error("Error submitting form:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
  return null;
}
