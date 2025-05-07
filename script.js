// Đổi chế độ sáng/tối
const themeToggle = document.querySelector('.theme-toggle');
const themeText = document.getElementById('theme-text');
const themeIcon = document.getElementById('theme-icon');
const body = document.body;

// Kiểm tra trạng thái sáng/tối từ localStorage khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark');
        themeText.textContent = 'Turn On The Lights';
        themeIcon.src = 'Light On.png';
    } else {
        body.classList.remove('dark');
        themeText.textContent = 'Turn Off The Lights';
        themeIcon.src = 'Light Off.png';
    }
});

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    if (body.classList.contains('dark')) {
        themeText.textContent = 'Turn On The Lights';
        themeIcon.src = 'Light On.png';
        localStorage.setItem('theme', 'dark'); // Lưu trạng thái tối
    } else {
        themeText.textContent = 'Turn Off The Lights';
        themeIcon.src = 'Light Off.png';
        localStorage.setItem('theme', 'light'); // Lưu trạng thái sáng
    }
});

// Nút Back to Top và Back to Main
const backToTopButton = document.getElementById('back-to-top');
const backToMainButton = document.getElementById('back-to-main');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.style.display = 'block';
        if (backToMainButton) {
            backToMainButton.style.display = 'block';
        }
    } else {
        backToTopButton.style.display = 'none';
        if (backToMainButton) {
            backToMainButton.style.display = 'none';
        }
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Vô hiệu hóa nhấp chuột phải và menu ngữ cảnh
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Nút chuyển đổi giữa Menu và Timeline (chỉ trên trang About Grok, dùng nút Hamburger)
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar-about-grok');
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
            console.log('Nút Hamburger được nhấn - Chuyển đổi Menu/Timeline');
            sidebar.classList.toggle('active');
        });
    } else {
        console.log('Không tìm thấy Hamburger hoặc Sidebar About Grok');
    }
});

// Đảo ngược timeline và nội dung chi tiết (dùng nút Turn)
const reverseTimeline = document.getElementById('reverse-timeline');
const timelineList = document.getElementById('timeline-list');
const timelineDetails = document.getElementById('timeline-details');
if (reverseTimeline && timelineList && timelineDetails) {
    reverseTimeline.addEventListener('click', () => {
        console.log('Nút Turn được nhấn - Đảo ngược Timeline');
        const timelineItems = Array.from(timelineList.children);
        timelineItems.reverse();
        timelineList.innerHTML = '';
        timelineItems.forEach(item => timelineList.appendChild(item));
        const detailItems = Array.from(timelineDetails.children);
        detailItems.reverse();
        timelineDetails.innerHTML = '';
        detailItems.forEach(item => timelineDetails.appendChild(item));
    });
} else {
    console.log('Không tìm thấy Reverse Timeline hoặc các phần tử liên quan');
}

// Cuộn mượt mà khi nhấn mốc thời gian trên timeline
document.querySelectorAll('#timeline-list li a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Thêm EmailJS cho trang Contact
(function() {
    emailjs.init("ggtufPFpMq0k5H59a");
})();

// Xử lý gửi biểu mẫu liên hệ (trang Contact)
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            emailjs.send('service_vcyahce', 'template_0enkxes', formData)
                .then(() => {
                    alert('Thank you for your message! I will get back to you soon.');
                    contactForm.reset();
                }, (error) => {
                    alert('Oops! Something went wrong. Please try again later.');
                    console.log('EmailJS Error:', error);
                });
        });
    }
});