// أكواد الخدام
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

// 7. البحث والتصفية
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

// 8. حساب وعرض ميعاد الاجتماع القادم (يوم خميس) تلقائيًا
function displayNextMeeting() {
    const meetingBox = document.getElementById('nextMeeting');
    if (!meetingBox) return;

    const now = new Date();
    const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

    const THURSDAY = 4;
    const meetingHour = 16;
    const meetingMinute = 15;

    let daysUntilThursday = (THURSDAY - now.getDay() + 7) % 7;

    const nextThursday = new Date(now);
    nextThursday.setDate(now.getDate() + daysUntilThursday);
    nextThursday.setHours(meetingHour, meetingMinute, 0, 0);

    if (daysUntilThursday === 0 && now > nextThursday) {
        nextThursday.setDate(nextThursday.getDate() + 7);
    }

    const dayLabel = dayNames[nextThursday.getDay()];
    const dateLabel = `${nextThursday.getDate()} ${monthNames[nextThursday.getMonth()]}`;

    meetingBox.innerHTML = `📅 الاجتماع القادم: ${dayLabel} ${dateLabel} - الساعة 4:15 م`;
}

document.addEventListener('DOMContentLoaded', displayNextMeeting);

// 9. تنفيذ الاتصال فور الضغط على الزرار
function makeCall(phoneNumber, servantTitle) {
    const userConfirmed = confirm(`📞  الاتصال بـ أ. ${servantTitle}\nالرقم: ${phoneNumber}\n\nهل تريد الاتصال الآن؟`);
    if (userConfirmed) {
        window.location.href = `tel:${phoneNumber}`;
    }
}

// 10. تصدير بيانات المخدومين إلى ملف Excel
function exportToExcel() {
    const data = getMakhdoumin();

    if (data.length === 0) {
        alert("لا يوجد بيانات مخدومين لتصديرها!");
        return;
    }

    const exportData = data.map(user => ({
        "الاسم": user.name,
        "التليفون": user.phone,
        "العنوان": user.address,
        "تاريخ الميلاد": user.birthdate || '-',
        "السن": user.age,
        "الدرجة": user.grade
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet['!cols'] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 30 },
        { wch: 15 },
        { wch: 8 },
        { wch: 10 }
    ];

    worksheet['!dir'] = 'rtl';

    const workbook = XLSX.utils.book_new();
    workbook.Workbook = { Views: [{ RTL: true }] };
    XLSX.utils.book_append_sheet(workbook, worksheet, "المخدومين");

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `قائمة_المخدومين_${today}.xlsx`);
}

// 11. طباعة / حفظ بيانات المخدومين كملف PDF
function exportToPDF() {
    const data = getMakhdoumin();

    if (data.length === 0) {
        alert("لا يوجد بيانات مخدومين للطباعة!");
        return;
    }

    let rowsHtml = '';
    data.forEach(user => {
        rowsHtml += `
            <tr>
                <td>${user.name}</td>
                <td>${user.phone}</td>
                <td>${user.address}</td>
                <td>${user.birthdate || '-'}</td>
                <td>${user.age}</td>
                <td>${user.grade}</td>
            </tr>
        `;
    });

    const today = new Date().toLocaleDateString('ar-EG');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>قائمة المخدومين</title>
            <style>
                body { font-family: 'Tahoma', sans-serif; padding: 25px; direction: rtl; color: #111; }
                h2 { text-align: center; margin-bottom: 4px; }
                p.sub { text-align: center; color: #555; margin-bottom: 20px; font-size: 13px; }
                table { width: 100%; border-collapse: collapse; font-size: 13px; }
                th, td { border: 1px solid #333; padding: 8px 10px; text-align: right; }
                th { background: #f0f0f0; }
                tr:nth-child(even) { background: #fafafa; }
            </style>
        </head>
        <body>
            <h2>قائمة المخدومين والدرجات</h2>
            <p class="sub">اجتماع إعدادي مارجرجس - كنيسة الشهيد العظيم مارجرجس بالإسماعيلية | تاريخ الطباعة: ${today}</p>
            <table>
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>التليفون</th>
                        <th>العنوان</th>
                        <th>تاريخ الميلاد</th>
                        <th>السن</th>
                        <th>الدرجة</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
    }, 400);
}

// 12. تنزيل وتثبيت التطبيق على الهاتف (PWA)
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

async function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('تم قبول التثبيت بنجاح');
        }
        deferredPrompt = null;
    } else {
        alert("📲 لتثبيت التطبيق على هاتفك:\n\n1️⃣ متصفح Chrome (أندرويد):\nاضغط على القائمة (⋮) ثم اختر 'تثبيت التطبيق' أو 'الإضافة إلى الشاشة الرئيسية'.\n\n2️⃣ متصفح Safari (آيفون):\nاضغط زر المشاركة (Share ⎋) ثم اختر 'إضافة إلى الشاشة الرئيسية' (Add to Home Screen).");
    }
}

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    alert("🎉 تم تثبيت تطبيق الاجتماع بنجاح!");
});
