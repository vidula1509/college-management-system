import { useEffect, useState } from "react";

const emptyForm = {
  studentId: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  year: "",
};

function App() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const API_URL = "http://localhost:5000/api/students";

  const loadStudents = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setStudents(data);
    } catch {
      setMessage("Could not connect to the backend.");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          year: Number(formData.year),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Something went wrong.");
        return;
      }

      setMessage(editingId ? "Student updated successfully." : "Student added successfully.");
      setFormData(emptyForm);
      setEditingId(null);
      loadStudents();
    } catch {
      setMessage("Could not save the student.");
    }
  };

  const handleEdit = (student) => {
    setFormData({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      year: student.year,
    });
    setEditingId(student._id);
    setMessage("Edit the student details and click Update Student.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Do you want to delete this student?");

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not delete student.");
        return;
      }

      setMessage("Student deleted successfully.");
      loadStudents();
    } catch {
      setMessage("Could not delete student.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setMessage("");
  };

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.studentId} ${student.department}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <header>
        <div>
          <p className="small-title">College Management System</p>
          <h1>Student Records</h1>
        </div>
        <span className="badge">{students.length} Students</span>
      </header>

      <main>
        <section className="card form-card">
          <h2>{editingId ? "Edit Student" : "Add New Student"}</h2>

          {message && <p className="message">{message}</p>}

          <form onSubmit={handleSubmit}>
            <input
              name="studentId"
              placeholder="Student ID (Example: STU001)"
              value={formData.studentId}
              onChange={handleChange}
              required
            />

            <input
              name="name"
              placeholder="Student Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <input
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              required
            />

            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>

            <div className="form-buttons">
              <button type="submit">
                {editingId ? "Update Student" : "Add Student"}
              </button>

              {editingId && (
                <button type="button" className="secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card table-card">
          <div className="table-heading">
            <div>
              <h2>All Students</h2>
              <p>View, update, or remove student records.</p>
            </div>

            <input
              className="search"
              placeholder="Search students..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td>{student.studentId}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>{student.department}</td>
                      <td>{student.year}</td>
                      <td className="actions">
                        <button className="edit" onClick={() => handleEdit(student)}>
                          Edit
                        </button>
                        <button className="delete" onClick={() => handleDelete(student._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty">
                      No students found. Add your first student using the form.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;