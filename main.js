// 1. إعدادات Firebase (استبدل القيم بالقيم الخاصة بمشروعك من Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyDEluAU9Y0yC5s0YDu9B1GeHAIGKthL8Ks",
    authDomain: "margerges-e3dady.firebaseapp.com",
    projectId: "margerges-e3dady",
    storageBucket: margerges-e3dady.firebasestorage.app",
    messagingSenderId: "872929460042",
    appId: "1:872929460042:web:cfd0236b81cc8c15540bb3"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const ADMIN_CODES = ["9855"];
let isEditing = false;
let currentEditingId = null;

// 2. تسجيل الدخول
async function handleLogin() {
    const inputVal = document.getElementById('loginInput').value.trim();
    if (!inputVal) return alert("من فضلك ادخل الاسم أو الكود!");

    if (ADMIN_CODES.includes(inputVal)) {
        switchScreen('adminSection');
        renderTable();
    } else {
        try {
            const snapshot = await db.collection("makhdoumin").get();
            let foundUser = null;

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.name.toLowerCase() === inputVal.toLowerCase()) {
                    foundUser = data;
                }
            });

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
        } catch (error) {
            console.error("خطأ في جلب البيانات:", error);
            alert("حدث خطأ أثناء الاتصال بقاعدة البيانات");
        }
    }
}

// 3. حفظ أو تعديل مخدوم في Firebase
async function saveMakhdoum(event) {
    event.preventDefault();

    const makhdoumObj = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        birthdate: document.getElementById('birthdate').value,
        age: Number(document.getElementById('age').value),
        grade: Number(document.getElementById('grade').value)
    };

    try {
        if (isEditing && currentEditingId) {
            await db.collection("makhdoumin").doc(currentEditingId).update(makhdoumObj);
            isEditing = false;
            currentEditingId = null;
            resetFormState();
        } else {
            await db.collection("makhdoumin").add(makhdoumObj);
        }

        document.getElementById('makhdoumForm').reset();
        renderTable();
    } catch (error) {
        console.error("خطأ في حفظ البيانات:", error);
        alert("لم يتم الحفظ، تأكد من الاتصال بالإنترنت.");
    }
}

// 4. عرض الجدول مباشرة من Firebase
async function renderTable() {
    const tbody = document.querySelector('#makhdoumTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">جاري تحميل البيانات...</td></tr>';

    try {
        const snapshot = await db.collection("makhdoumin").get();
        tbody.innerHTML = '';

        if (snapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-secondary); padding: 30px;">لا يوجد مخدومين مسجلين حتى الآن</td></tr>`;
            return;
        }

        snapshot.forEach(doc => {
            const user = doc.data();
            const id = doc.id;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${user.name}</strong></td>
                <td>${user.phone}</td>
                <td>${user.address}</td>
                <td>${user.birthdate || '-'}</td>
                <td>${user.age}</td>
                <td><span style="color: var(--accent-green); font-weight: bold;">${user.grade}</span></td>
                <td>
                    <button class="tbl-btn edit" onclick="prepareEdit('${id}')">تعديل</button>
                    <button class="tbl-btn delete" onclick="deleteMakhdoum('${id}', '${user.name}')">حذف</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("خطأ في تحميل الجدول:", error);
    }
}

// 5. التعديل والحذف
async function prepareEdit(id) {
    try {
        const doc = await db.collection("makhdoumin").doc(id).get();
        if (doc.exists) {
            const user = doc.data();
            document.getElementById('name').value = user.name;
            document.getElementById('phone').value = user.phone;
            document.getElementById('address').value = user.address;
            document.getElementById('birthdate').value = user.birthdate || '';
            document.getElementById('age').value = user.age;
            document.getElementById('grade').value = user.grade;

            isEditing = true;
            currentEditingId = id;

            document.getElementById('formTitle').innerText = "✏️ تعديل بيانات مخدوم";
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.innerText = "تحديث البيانات الآن";
            submitBtn.className = "btn-action amber";
        }
    } catch (error) {
        console.error("خطأ:", error);
    }
}

function resetFormState() {
    document.getElementById('formTitle').innerText = "➕ إضافة مخدوم جديد";
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = "حفظ المخدوم 💾";
    submitBtn.className = "btn-action success";
}

async function deleteMakhdoum(id, name) {
    if (confirm(`هل أنت متأكد من حذف (${name})؟`)) {
        try {
            await db.collection("makhdoumin").doc(id).delete();
            renderTable();
        } catch (error) {
            console.error("خطأ أثناء الحذف:", error);
        }
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
    isEditing = false;
    currentEditingId = null;
    document.getElementById('makhdoumForm').reset();
    resetFormState();
    switchScreen('loginSection');
}
