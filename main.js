const ADMIN_CODES = ["9855"];
let isEditing = false;
let currentEditingIndex = -1;

// 1. إدارة البيانات محلياً
function getMakhdoumin() {
    return JSON.parse(localStorage.getItem('makhdouminData')) || [];
}

function saveMakhdouminToStorage(data) {
    localStorage.setItem('makhdouminData', JSON.stringify(data));
}

// 2. تسجيل الدخول
function handleLogin() {
    const inputVal = document.getElementById('loginInput').value.trim();
    if (!inputVal) return alert("من فضلك ادخل الاسم أو الكود!");

    if (ADMIN_CODES.includes(inputVal)) {
        switchScreen('adminSection');
        renderTable();
    } else {
        const data = getMakhdoumin();
        const foundUser = data.find(user => user.name.toLowerCase() === inputVal.toLowerCase());

        if (foundUser) {
            switchScreen('userSection');
            document.getElementById('userData').innerHTML = `
                <div class="stat-box"><label>الاسم الكامل</label><span>👤 ${foundUser.name}</span></div>
                <div class="stat-box"><label>رقم التليفون</label><span>📞 ${foundUser.phone}</span></div>
                <div class="stat-box"><label>العنوان</label><span>📍 ${foundUser.address}</span></div>
                <div class="stat-box"><label>تاريخ الميلاد</label><span>📅 ${foundUser.birthdate || '-'}</span></div>
                <div class="stat-box"><label>السن</label><span>🎂 ${foundUser.age} سنة</span></div>
                <div class="stat-box" style="border-color: var(--accent-green);"><label>الدرجة / التقييم</label><span style="color: var(--accent-green);">🏆 ${foundUser.grade} درجات</span></div>
            `;
        } else {
            alert("الاسم غير موجود، تأكد من كتابته بشكل صحيح!");
        }
    }
}

// 3. حفظ أو تعديل مخدوم
function saveMakhdoum(event) {
    event.preventDefault();
    const data = getMakhdoumin();

    const makhdoumObj = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        birthdate: document.getElementById('birthdate').value,
        age: Number(document.getElementById('age').value),
        grade: Number(document.getElementById('grade').value)
    };

    if (isEditing && currentEditingIndex !== -1) {
        data[currentEditingIndex] = makhdoumObj;
        isEditing = false;
        currentEditingIndex = -1;
        resetFormState();
    } else {
        data.push(makhdoumObj);
    }

    saveMakhdouminToStorage(data);
    document.getElementById('makhdoumForm').reset();
    renderTable();
}

// 4. عرض الجدول
function renderTable() {
    const tbody = document.querySelector('#makhdoumTable tbody');
    if (!tbody) return;

    const data = getMakhdoumin();
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-secondary); padding: 30px;">لا يوجد مخدومين مسجلين حتى الآن</td></tr>`;
        return;
    }

    data.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${user.name}</strong></td>
            <td>${user.phone}</td>
            <td>${user.address}</td>
            <td>${user.birthdate || '-'}</td>
            <td>${user.age}</td>
            <td><span style="color: var(--accent-green); font-weight: bold;">${user.grade}</span></td>
            <td>
                <button class="tbl-btn edit" onclick="prepareEdit(${index})">تعديل</button>
                <button class="tbl-btn delete" onclick="deleteMakhdoum(${index})">حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    filterTable();
}

// 5. التعديل والحذف
function prepareEdit(index) {
    const data = getMakhdoumin();
    const user = data[index];

    document.getElementById('name').value = user.name;
    document.getElementById('phone').value = user.phone;
    document.getElementById('address').value = user.address;
    document.getElementById('birthdate').value = user.birthdate || '';
    document.getElementById('age').value = user.age;
    document.getElementById('grade').value = user.grade;

    isEditing = true;
    currentEditingIndex = index;

    document.getElementById('formTitle').innerText = "✏️ تعديل بيانات مخدوم";
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = "تحديث البيانات الآن";
    submitBtn.className = "btn-action amber";
}

function resetFormState() {
    document.getElementById('formTitle').innerText = "➕ إضافة مخدوم جديد";
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = "حفظ المخدوم 💾";
    submitBtn.className = "btn-action success";
}

function deleteMakhdoum(index) {
    const data = getMakhdoumin();
    if (confirm(`هل أنت متأكد من حذف (${data[index].name})؟`)) {
        data.splice(index, 1);
        saveMakhdouminToStorage(data);
        renderTable();
    }
}

// 6. التنقل والـ Logout
function switchScreen(screenId) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('userSection').style.display = 'none';
    document.getElementById(screenId).style.display = 'block';
}

function logout() {
    document.getElementById('loginInput').value = "";
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = "";
    isEditing = false;
    currentEditingIndex = -1;
    document.getElementById('makhdoumForm').reset();
    resetFormState();
    switchScreen('loginSection');
}

// 7. دالة البحث والفلترة في الجدول
function filterTable() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const filter = searchInput.value.toLowerCase().trim();
    const rows = document.querySelectorAll('#makhdoumTable tbody tr');

    rows.forEach(row => {
        const nameCell = row.cells[0]?.textContent.toLowerCase() || '';
        const phoneCell = row.cells[1]?.textContent.toLowerCase() || '';

        if (nameCell.includes(filter) || phoneCell.includes(filter)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
