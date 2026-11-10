
import { useState, useEffect } from "react";

function App() {

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState("");
  const [emailHistory, setEmailHistory] = useState([]);

  useEffect(() => {
    fetch("https://bulkmail-xglt.onrender.com/email-history")
      .then((response) => response.json())
      .then((data) => setEmailHistory(data))
      .catch((error) => console.log("History Error:", error));
  }, []);

  async function handleSend() {
    // Convert recipient text into an array
    const recipientList = recipients
      .split(/[,\n]+/)
      .map((email) => email.trim())
      .filter((email) => email !== "");

    // Check if fields are empty
    if (!subject.trim() || !body.trim() || recipientList.length === 0) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("https://bulkmail-xglt.onrender.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subject,
          body,
          recipients: recipientList
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong!");
      }

      setMessage(data.message);

      const historyResponse = await fetch("http://localhost:5001/email-history");
      const historyData = await historyResponse.json();

      setEmailHistory(historyData);

      // Clear the form after successful submission
      setSubject("");
      setBody("");
      setRecipients("");

    } catch (error) {
      console.log(error);
      setMessage("Unable to save email. Please try again.");
    }
  }

  return (
    <div className="app">
      <h1>BulkMail</h1>
      <p>Send emails to multiple people at once.</p>

      <div className="form">

        <label>Email Subject</label>
        <input
          type="text"
          placeholder="Enter email subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <label>Recipient Emails</label>
        <textarea
          placeholder="Enter email addresses separated by commas"
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
        />

        <label>Email Message</label>
        <textarea
          placeholder="Write your email message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <button onClick={handleSend}>
          Send Emails
        </button>


        <p>{message}</p>
        <h2>Email History</h2>

        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Recipients</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {emailHistory.map((email) => (
              <tr key={email._id}>
                <td>{email.subject}</td>
                <td>{email.recipients.join(", ")}</td>
                <td>{email.status}</td>
                <td>{new Date(email.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default App;
