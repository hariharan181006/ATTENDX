initPage('students', async (u, m) => {
  const canManage = u.role === 'faculty' || u.role === 'principal';

  m.innerHTML = `
    <div class="panel">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div>
          <h3 style="margin:0 0 5px">Student Records</h3>
          <small>View student details and attendance percentage.</small>
        </div>
        ${canManage ? '<button id="addStudentBtn" class="btn">Add Student</button>' : ''}
      </div>
      <div id="studentMsg"></div>
    </div>

    <div class="panel">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <h3 style="margin:0">Students</h3>
        <b>Total: <span id="studentCount">0</span></b>
      </div>
      <div id="studentTable"></div>
    </div>

    ${canManage ? `
    <div id="studentModal" style="display:none;position:fixed;inset:0;background:#0007;z-index:1000;padding:20px;overflow:auto">
      <div class="panel" style="max-width:560px;margin:40px auto">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h3 id="studentModalTitle" style="margin-top:0">Add Student</h3>
          <button type="button" id="closeStudentModal" class="btn r">Close</button>
        </div>

        <form id="studentForm">
          <input type="hidden" id="studentEditId">

          <div class="grid">
            <label>Register Number
              <input id="studentRegNo" required maxlength="30">
            </label>

            <label>Student Name
              <input id="studentName" required maxlength="80">
            </label>

            <label>Department
              <input id="studentDepartment" required maxlength="60">
            </label>

            <label>Year
              <select id="studentYear" required>
                <option value="">Select Year</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
              </select>
            </label>

            <label>Password
              <input id="studentPassword" type="password" minlength="4" maxlength="100">
              <small id="passwordHelp">Required when adding a student.</small>
            </label>
          </div>

          <div id="studentFormMsg"></div>

          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
            <button type="button" id="cancelStudentBtn" class="btn r">Cancel</button>
            <button type="submit" class="btn" id="saveStudentBtn">Add Student</button>
          </div>
        </form>
      </div>
    </div>` : ''}
  `;

  let students = [];

  function showMsg(message, type = 'ok') {
    const box = $('studentMsg');
    if (box) box.innerHTML = `<div class="msg ${type}">${esc(message)}</div>`;
  }

  function showFormMsg(message, type = 'err') {
    $('studentFormMsg').innerHTML = message
      ? `<div class="msg ${type}">${esc(message)}</div>`
      : '';
  }

  function openModal(student = null) {
    $('studentForm').reset();
    showFormMsg('');

    const editing = !!student;
    $('studentModalTitle').textContent = editing ? 'Edit Student' : 'Add Student';
    $('saveStudentBtn').textContent = editing ? 'Update Student' : 'Add Student';
    $('studentEditId').value = editing ? student.id : '';
    $('studentRegNo').value = editing ? student.reg_no : '';
    $('studentName').value = editing ? student.name : '';
    $('studentDepartment').value = editing ? student.department : '';
    $('studentYear').value = editing ? student.year : '';
    $('studentPassword').value = '';

    $('studentRegNo').readOnly = editing;
    $('studentPassword').required = !editing;
    $('passwordHelp').textContent = editing
      ? 'Leave blank to keep the current password.'
      : 'Required when adding a student.';

    $('studentModal').style.display = 'block';
  }

  function closeModal() {
    $('studentModal').style.display = 'none';
    showFormMsg('');
  }

  function render() {
    $('studentCount').textContent = students.length;

    const rows = students.map(s => `
      <tr>
        <td>${esc(s.reg_no)}</td>
        <td>${esc(s.name)}</td>
        <td>${esc(s.department)}</td>
        <td>${esc(s.year)}</td>
        <td>${s.pct}%</td>
        ${canManage ? `
        <td>
          <button class="btn s edit-student" data-id="${s.id}">Edit</button>
          <button class="btn r s delete-student" data-id="${s.id}">Delete</button>
        </td>` : ''}
      </tr>
    `);

    const headers = ['Register Number','Student Name','Department','Year','Attendance %'];
    if (canManage) headers.push('Action');

    $('studentTable').innerHTML = table(headers, rows);

    document.querySelectorAll('.edit-student').forEach(btn => {
      btn.onclick = () => {
        const student = students.find(x => String(x.id) === String(btn.dataset.id));
        if (student) openModal(student);
      };
    });

    document.querySelectorAll('.delete-student').forEach(btn => {
      btn.onclick = async () => {
        const student = students.find(x => String(x.id) === String(btn.dataset.id));
        if (!student) return;

        if (!confirm(`Delete student ${student.reg_no} - ${student.name}?`)) return;

        try {
          await api(`/students/${student.id}`, { method: 'DELETE' });
          showMsg('Student deleted successfully.');
          await loadStudents();
        } catch (err) {
          showMsg(err.message, 'err');
        }
      };
    });
  }

  async function loadStudents() {
    try {
      const r = await api('/students');
      students = r.rows || [];
      render();
    } catch (err) {
      $('studentTable').innerHTML = `<div class="msg err">${esc(err.message)}</div>`;
    }
  }

  if (canManage) {
    $('addStudentBtn').onclick = () => openModal();
    $('closeStudentModal').onclick = closeModal;
    $('cancelStudentBtn').onclick = closeModal;

    $('studentModal').onclick = e => {
      if (e.target === $('studentModal')) closeModal();
    };

    $('studentForm').onsubmit = async e => {
      e.preventDefault();
      showFormMsg('');

      const editId = $('studentEditId').value;
      const body = {
        reg_no: $('studentRegNo').value.trim(),
        name: $('studentName').value.trim(),
        department: $('studentDepartment').value.trim(),
        year: $('studentYear').value,
        password: $('studentPassword').value
      };

      if (!body.reg_no || !body.name || !body.department || !body.year) {
        showFormMsg('Please fill all required fields.');
        return;
      }

      if (!editId && !body.password) {
        showFormMsg('Password is required when adding a student.');
        return;
      }

      try {
        if (editId) {
          if (!body.password) delete body.password;
          await api(`/students/${editId}`, { method: 'PUT', body });
          showMsg('Student updated successfully.');
        } else {
          await api('/students', { method: 'POST', body });
          showMsg('Student added successfully.');
        }

        closeModal();
        await loadStudents();
      } catch (err) {
        showFormMsg(err.message);
      }
    };
  }

  await loadStudents();
});