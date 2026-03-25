/* ===== INTERNATIONALISATION ===== */
(function() {

  const translations = {
    en: {
      /* NAV */
      nav_home: 'Home',
      nav_book_now: 'Book Now',
      nav_contact: 'Contact',
      nav_book_btn: 'Book a Clean',
      nav_online: 'Online 24/7',

      /* HERO */
      hero_badge: 'Available 24 Hours · 7 Days a Week',
      hero_title: 'Your Home,',
      hero_title2: 'Perfectly',
      hero_highlight: 'Clean',
      hero_desc: 'Professional cleaning services tailored to your schedule. From standard home cleans to deep sanitization — we bring the sparkle back to your space.',
      hero_cta1: 'Book a Cleaning',
      hero_cta2: 'Our Services',
      hero_stat1: 'Homes Cleaned',
      hero_stat2: 'Satisfaction Rate',
      hero_stat3: 'Average Rating',
      hero_card_cta: 'Book Online — It\'s Easy →',

      /* SERVICES */
      services_tag: 'What We Offer',
      services_title: 'Our Cleaning Services',
      services_subtitle: 'From everyday tidying to comprehensive deep cleans — we cover every corner of your home or office.',
      services_cta: 'Book Any Service Now',

      svc1_name: 'Standard Cleaning',
      svc1_desc: 'Perfect for regular maintenance. We dust, vacuum, mop and sanitize all key areas of your home.',
      svc1_f1: 'Kitchen & bathrooms', svc1_f2: 'Dusting & vacuuming', svc1_f3: 'Floor mopping', svc1_f4: 'Trash removal',

      svc2_name: 'Deep Cleaning',
      svc2_desc: 'A thorough top-to-bottom clean for when your home needs extra attention and care.',
      svc2_f1: 'Everything in Standard', svc2_f2: 'Inside appliances', svc2_f3: 'Baseboards & vents', svc2_f4: 'Cabinet interiors',

      svc3_name: 'Move In / Out',
      svc3_desc: 'Get your new home spotless before moving in, or leave your old one in perfect condition.',
      svc3_f1: 'Full property clean', svc3_f2: 'Walls & windows', svc3_f3: 'Deep appliance clean', svc3_f4: 'Garage & storage',

      svc4_name: 'Office Cleaning',
      svc4_desc: 'Maintain a pristine and professional workspace that keeps your team motivated.',
      svc4_f1: 'Desks & workstations', svc4_f2: 'Kitchenettes & bathrooms', svc4_f3: 'Floors & carpets', svc4_f4: 'Waste management',

      svc5_name: 'Window Cleaning',
      svc5_desc: 'Crystal-clear windows, inside and out — we use streak-free professional techniques.',
      svc5_f1: 'Interior & exterior', svc5_f2: 'Streak-free finish', svc5_f3: 'Frames & tracks', svc5_f4: 'All window types',

      svc6_name: 'Sofa/Mattress Cleaning',
      svc6_desc: 'Deep clean and sanitize your sofas and mattresses — removing stains, allergens and odors.',
      svc6_f1: 'Steam cleaning', svc6_f2: 'Stain removal', svc6_f3: 'Deodorizing', svc6_f4: 'All fabric types',

      /* WHY US */
      why_tag: 'Why Choose Us',
      why_title: 'We Do More Than Just Clean',
      why_subtitle: 'We bring reliability, professionalism and a genuine passion for clean spaces to every job.',
      why1_title: 'Available 24/7',
      why1_desc: 'We work around your schedule — early mornings, late nights, weekends. We\'re always here when you need us.',
      why2_title: 'Fully Insured & Vetted',
      why2_desc: 'Every cleaner is background-checked, trained, and insured for your complete peace of mind.',
      why3_title: 'Eco-Friendly Products',
      why3_desc: 'We use only safe, non-toxic cleaning products that are good for your family, pets and the planet.',
      why4_title: 'Transparent Pricing',
      why4_desc: 'No hidden fees. What you see when you book is exactly what you pay. No surprises.',
      why_stat1: 'Years of Experience',
      why_stat2: 'Happy Customers',
      why_badge1: '✓ Insured', why_badge2: '✓ Background Checked', why_badge3: '✓ Eco-Friendly',
      why_badge4: '✓ 24/7 Support', why_badge5: '✓ Satisfaction Guarantee',

      /* HOW IT WORKS */
      steps_title: 'How It Works',
      steps_subtitle: 'Booking a professional clean is simple — takes less than 3 minutes.',
      step1_title: 'Enter Your Info',
      step1_desc: 'Log in or continue as a guest — just leave your name, phone and email so we can confirm your booking.',
      step2_title: 'Choose a Service',
      step2_desc: 'Pick the type of cleaning that suits your needs — from a quick standard clean to a full deep clean.',
      step3_title: 'Pick Date & Time',
      step3_desc: 'Select a date and preferred time slot. We\'re available 24/7, so any time works for us.',
      step4_title: 'We Show Up & Clean',
      step4_desc: 'Our vetted professional team arrives on time with all equipment and gets your space spotless.',
      steps_cta: 'Start Booking →',

      /* TESTIMONIALS */
      test_title: 'What Our Customers Say',
      test_subtitle: 'Don\'t just take our word for it — here\'s what happy customers are saying.',
      test1: '"Absolutely incredible service! My apartment has never been this clean. They arrived on time, were thorough, and left everything sparkling. Will definitely book again!"',
      test1_name: 'Sarah M.',
      test1_service: 'Standard Cleaning · New York',
      test2: '"Used Homelines for our office deep clean — the team was professional and efficient. They worked overnight so we weren\'t disrupted. The 24/7 availability is a game changer."',
      test2_name: 'James R.',
      test2_service: 'Office Cleaning · Chicago',
      test3: '"Booked the move-out clean and I\'m so glad I did. Got my full security deposit back. The booking process online is incredibly smooth and easy. Highly recommend!"',
      test3_name: 'Anna K.',
      test3_service: 'Move Out Clean · Los Angeles',

      /* CTA BANNER */
      cta_title: 'Ready for a Spotless Home?',
      cta_desc: 'Book your cleaning in under 3 minutes. Available 24 hours a day, 7 days a week.',
      cta_btn1: 'Book Now',
      cta_btn2: 'Contact Us',

      /* FOOTER */
      footer_desc: 'Professional cleaning services available 24 hours a day, 7 days a week. Your satisfaction is our guarantee.',
      footer_services: 'Services',
      footer_company: 'Company',
      footer_contact: 'Contact',
      footer_fl1: '→ Standard Cleaning', footer_fl2: '→ Deep Cleaning', footer_fl3: '→ Move In/Out',
      footer_fl4: '→ Office Cleaning', footer_fl5: '→ Window Cleaning', footer_fl6: '→ Sofa/Mattress Cleaning',
      footer_cl1: '→ Home', footer_cl2: '→ Book a Clean', footer_cl3: '→ Contact Us',
      footer_cl4: '→ About Us', footer_cl5: '→ Reviews',
      footer_open: 'Open 24/7 — Always Available',
      footer_copy: '© 2025 Homelines Cleaning. All rights reserved.',
      footer_privacy: 'Privacy Policy',
      footer_terms: 'Terms of Service',

      /* CONTACT PAGE */
      contact_hero_title: 'Get In Touch',
      contact_hero_subtitle: 'We\'d love to hear from you. Reach out via the form, phone or email — we\'re available 24/7.',
      contact_form_title: 'Send Us a Message',
      contact_form_subtitle: 'Fill out the form below and we\'ll get back to you within 1 hour.',
      contact_name: 'Full Name *',
      contact_name_ph: 'John Smith',
      contact_email: 'Email Address *',
      contact_email_ph: 'john@example.com',
      contact_phone: 'Phone Number',
      contact_phone_ph: '+1 (555) 000-0000',
      contact_service: 'Service of Interest',
      contact_service_ph: '— Select a service —',
      contact_message: 'Message *',
      contact_message_ph: 'Tell us about your cleaning needs, property size, preferred timing, or any special requests...',
      contact_submit: 'Send Message →',
      contact_success: '✓ Message sent successfully! We\'ll be in touch within 1 hour.',
      contact_info_title: 'Contact Information',
      contact_hours_title: 'Hours of Operation',
      contact_hours_value: 'Open 24 Hours / 7 Days a Week',
      contact_faq_title: 'Frequently Asked Questions',

      /* BOOKING PAGE */
      booking_badge: 'Book a Professional Clean',
      booking_title: 'Book Your Cleaning',
      booking_subtitle: 'Fast, easy and secure. Takes less than 3 minutes.',
      step_label1: 'Your Info', step_label2: 'Service', step_label3: 'Date & Time', step_label4: 'Confirm',
      auth_guest_tab: 'Continue as Guest',
      auth_login_tab: 'Login',
      auth_name: 'Full Name *',
      auth_name_ph: 'John Smith',
      auth_email: 'Email *',
      auth_email_ph: 'john@example.com',
      auth_phone: 'Phone *',
      auth_phone_ph: '+1 (555) 000-0000',
      auth_continue: 'Continue →',
      auth_login_email: 'Email *',
      auth_login_pass: 'Password *',
      auth_login_btn: 'Login →',
      step2_title: 'Choose Your Service(s)',
      step2_subtitle: 'Select one or more services for your booking',
      step3_title: 'Select Date & Time',
      step4_title: 'Confirm Your Booking',
      sum_service: 'Service',
      sum_date: 'Date',
      sum_time: 'Time',
      sum_price: 'Total Price',
      sum_duration: 'Duration',
      sum_name: 'Name',
      sum_email: 'Email',
      sum_phone: 'Phone',
      confirm_btn: 'Confirm Booking →',
      booking_success_title: '🎉 Booking Confirmed!',
      booking_success_desc: 'Thank you! Your booking has been received. We\'ll send a confirmation to your email and contact you shortly.',
      booking_success_btn: 'Back to Home',
    },

    ru: {
      nav_home: 'Главная',
      nav_book_now: 'Записаться',
      nav_contact: 'Контакты',
      nav_book_btn: 'Заказать уборку',
      nav_online: 'Онлайн 24/7',

      hero_badge: 'Доступны 24 часа · 7 дней в неделю',
      hero_title: 'Ваш дом,',
      hero_title2: 'Безупречно',
      hero_highlight: 'Чистый',
      hero_desc: 'Профессиональные услуги уборки в удобное для вас время. От стандартной до глубокой санитарной обработки — мы вернём сияние вашему дому.',
      hero_cta1: 'Заказать уборку',
      hero_cta2: 'Наши услуги',
      hero_stat1: 'Убранных домов',
      hero_stat2: 'Довольных клиентов',
      hero_stat3: 'Средний рейтинг',
      hero_card_cta: 'Забронировать онлайн →',

      services_tag: 'Что мы предлагаем',
      services_title: 'Наши услуги уборки',
      services_subtitle: 'От ежедневного поддержания порядка до полной глубокой уборки — мы охватываем каждый уголок вашего дома или офиса.',
      services_cta: 'Заказать любую услугу',

      svc1_name: 'Стандартная уборка',
      svc1_desc: 'Идеально для регулярного поддержания чистоты. Вытираем пыль, пылесосим, моем полы и дезинфицируем ключевые зоны.',
      svc1_f1: 'Кухня и ванные', svc1_f2: 'Протирка пыли и пылесос', svc1_f3: 'Мытьё полов', svc1_f4: 'Вынос мусора',

      svc2_name: 'Генеральная уборка',
      svc2_desc: 'Тщательная уборка с головы до пят — когда вашему дому нужно особое внимание.',
      svc2_f1: 'Всё из стандартной', svc2_f2: 'Внутри техники', svc2_f3: 'Плинтусы и вентиляция', svc2_f4: 'Внутри шкафов',

      svc3_name: 'Уборка при переезде',
      svc3_desc: 'Приведём новое жильё в порядок перед въездом или оставим старое в идеальном состоянии.',
      svc3_f1: 'Полная уборка объекта', svc3_f2: 'Стены и окна', svc3_f3: 'Глубокая чистка техники', svc3_f4: 'Гараж и кладовая',

      svc4_name: 'Уборка офиса',
      svc4_desc: 'Поддерживайте безупречное рабочее пространство, которое мотивирует вашу команду.',
      svc4_f1: 'Столы и рабочие места', svc4_f2: 'Кухни и туалеты', svc4_f3: 'Полы и ковры', svc4_f4: 'Управление отходами',

      svc5_name: 'Мытьё окон',
      svc5_desc: 'Кристально чистые окна снаружи и изнутри — профессиональная техника без разводов.',
      svc5_f1: 'Изнутри и снаружи', svc5_f2: 'Без разводов', svc5_f3: 'Рамы и направляющие', svc5_f4: 'Все типы окон',

      svc6_name: 'Чистка дивана/матраса',
      svc6_desc: 'Глубокая чистка и дезинфекция диванов и матрасов — удаляем пятна, аллергены и запахи.',
      svc6_f1: 'Паровая чистка', svc6_f2: 'Удаление пятен', svc6_f3: 'Дезодорирование', svc6_f4: 'Все типы тканей',

      why_tag: 'Почему мы',
      why_title: 'Мы делаем больше, чем просто убираем',
      why_subtitle: 'Мы привносим надёжность, профессионализм и искреннюю любовь к чистоте в каждую работу.',
      why1_title: 'Доступны 24/7',
      why1_desc: 'Работаем по вашему расписанию — рано утром, поздно ночью, в выходные. Мы всегда здесь.',
      why2_title: 'Застрахованы и проверены',
      why2_desc: 'Каждый уборщик прошёл проверку биографии, обучение и застрахован для вашего спокойствия.',
      why3_title: 'Эко-продукты',
      why3_desc: 'Используем только безопасные, нетоксичные средства, которые подходят для семьи, животных и природы.',
      why4_title: 'Прозрачные цены',
      why4_desc: 'Никаких скрытых платежей. То, что вы видите при бронировании — это именно то, что вы платите.',
      why_stat1: 'Лет опыта',
      why_stat2: 'Довольных клиентов',
      why_badge1: '✓ Застрахованы', why_badge2: '✓ Проверены', why_badge3: '✓ Эко-продукты',
      why_badge4: '✓ Поддержка 24/7', why_badge5: '✓ Гарантия качества',

      steps_title: 'Как это работает',
      steps_subtitle: 'Забронировать уборку просто — займёт меньше 3 минут.',
      step1_title: 'Введите данные',
      step1_desc: 'Войдите или продолжите как гость — оставьте имя, телефон и email для подтверждения.',
      step2_title: 'Выберите услугу',
      step2_desc: 'Выберите тип уборки, подходящий вашим потребностям — от стандартной до генеральной.',
      step3_title: 'Выберите дату и время',
      step3_desc: 'Выберите дату и удобный временной слот. Мы доступны 24/7 — любое время подходит.',
      step4_title: 'Мы приедем и уберём',
      step4_desc: 'Наша проверенная команда приедет вовремя со всем оборудованием и наведёт идеальный порядок.',
      steps_cta: 'Начать бронирование →',

      test_title: 'Что говорят наши клиенты',
      test_subtitle: 'Не просто верьте нам на слово — вот что говорят довольные клиенты.',
      test1: '"Невероятный сервис! Моя квартира никогда не была такой чистой. Приехали вовремя, сделали всё тщательно. Обязательно закажу снова!"',
      test1_name: 'Сара М.',
      test1_service: 'Стандартная уборка · Нью-Йорк',
      test2: '"Заказали генеральную уборку офиса — команда была профессиональной и эффективной. Работали ночью, чтобы не мешать нам. Доступность 24/7 — это отличная возможность."',
      test2_name: 'Джеймс Р.',
      test2_service: 'Уборка офиса · Чикаго',
      test3: '"Заказал уборку при выезде и очень доволен. Вернули полный залог. Процесс бронирования онлайн очень удобный. Очень рекомендую!"',
      test3_name: 'Анна К.',
      test3_service: 'Уборка при выезде · Лос-Анджелес',

      cta_title: 'Готовы к идеальной чистоте?',
      cta_desc: 'Забронируйте уборку за 3 минуты. Доступно 24 часа в сутки, 7 дней в неделю.',
      cta_btn1: 'Записаться',
      cta_btn2: 'Связаться',

      footer_desc: 'Профессиональные услуги уборки 24 часа в сутки, 7 дней в неделю. Ваше удовлетворение — наша гарантия.',
      footer_services: 'Услуги',
      footer_company: 'Компания',
      footer_contact: 'Контакты',
      footer_fl1: '→ Стандартная уборка', footer_fl2: '→ Генеральная уборка', footer_fl3: '→ Переезд',
      footer_fl4: '→ Уборка офиса', footer_fl5: '→ Мытьё окон', footer_fl6: '→ Чистка дивана/матраса',
      footer_cl1: '→ Главная', footer_cl2: '→ Заказать уборку', footer_cl3: '→ Контакты',
      footer_cl4: '→ О нас', footer_cl5: '→ Отзывы',
      footer_open: 'Открыто 24/7 — Всегда доступно',
      footer_copy: '© 2025 Homelines Cleaning. Все права защищены.',
      footer_privacy: 'Политика конфиденциальности',
      footer_terms: 'Условия использования',

      contact_hero_title: 'Свяжитесь с нами',
      contact_hero_subtitle: 'Мы рады ответить на ваши вопросы. Напишите через форму, позвоните или отправьте email — доступны 24/7.',
      contact_form_title: 'Отправить сообщение',
      contact_form_subtitle: 'Заполните форму, и мы ответим в течение 1 часа.',
      contact_name: 'Полное имя *',
      contact_name_ph: 'Иван Иванов',
      contact_email: 'Email *',
      contact_email_ph: 'ivan@example.com',
      contact_phone: 'Телефон',
      contact_phone_ph: '+7 (999) 000-00-00',
      contact_service: 'Интересующая услуга',
      contact_service_ph: '— Выберите услугу —',
      contact_message: 'Сообщение *',
      contact_message_ph: 'Расскажите о ваших потребностях в уборке, размере объекта, предпочтительном времени...',
      contact_submit: 'Отправить →',
      contact_success: '✓ Сообщение отправлено! Мы свяжемся с вами в течение 1 часа.',
      contact_info_title: 'Контактная информация',
      contact_hours_title: 'Часы работы',
      contact_hours_value: 'Открыто 24 часа / 7 дней в неделю',
      contact_faq_title: 'Часто задаваемые вопросы',

      booking_badge: 'Забронировать уборку',
      booking_title: 'Забронировать уборку',
      booking_subtitle: 'Быстро, легко и безопасно. Займёт меньше 3 минут.',
      step_label1: 'Ваши данные', step_label2: 'Услуга', step_label3: 'Дата и время', step_label4: 'Подтверждение',
      auth_guest_tab: 'Продолжить как гость',
      auth_login_tab: 'Войти',
      auth_name: 'Полное имя *',
      auth_name_ph: 'Иван Иванов',
      auth_email: 'Email *',
      auth_email_ph: 'ivan@example.com',
      auth_phone: 'Телефон *',
      auth_phone_ph: '+7 (999) 000-00-00',
      auth_continue: 'Продолжить →',
      auth_login_email: 'Email *',
      auth_login_pass: 'Пароль *',
      auth_login_btn: 'Войти →',
      step2_title: 'Выберите услугу(и)',
      step2_subtitle: 'Выберите одну или несколько услуг',
      step3_title: 'Выберите дату и время',
      step4_title: 'Подтвердите бронирование',
      sum_service: 'Услуга',
      sum_date: 'Дата',
      sum_time: 'Время',
      sum_price: 'Итого',
      sum_duration: 'Длительность',
      sum_name: 'Имя',
      sum_email: 'Email',
      sum_phone: 'Телефон',
      confirm_btn: 'Подтвердить →',
      booking_success_title: '🎉 Бронирование подтверждено!',
      booking_success_desc: 'Спасибо! Ваш заказ принят. Мы отправим подтверждение на email и скоро свяжемся с вами.',
      booking_success_btn: 'На главную',
    },

    tr: {
      nav_home: 'Ana Sayfa',
      nav_book_now: 'Rezerve Et',
      nav_contact: 'İletişim',
      nav_book_btn: 'Temizlik Rezervasyonu',
      nav_online: 'Çevrimiçi 7/24',

      hero_badge: '7 Gün 24 Saat Hizmetinizdeyiz',
      hero_title: 'Eviniz,',
      hero_title2: 'Kusursuzca',
      hero_highlight: 'Temiz',
      hero_desc: 'Programınıza göre özelleştirilmiş profesyonel temizlik hizmetleri. Standart ev temizliğinden derin sanitizasyona — evinize parlaklık getiriyoruz.',
      hero_cta1: 'Temizlik Rezervasyonu Yap',
      hero_cta2: 'Hizmetlerimiz',
      hero_stat1: 'Temizlenen Ev',
      hero_stat2: 'Memnuniyet Oranı',
      hero_stat3: 'Ortalama Puan',
      hero_card_cta: 'Online Rezervasyon Yap →',

      services_tag: 'Neler Sunuyoruz',
      services_title: 'Temizlik Hizmetlerimiz',
      services_subtitle: 'Günlük düzenlemeden kapsamlı derin temizliğe — evinizin veya ofisinizin her köşesini kapsıyoruz.',
      services_cta: 'Herhangi Bir Hizmeti Rezerve Et',

      svc1_name: 'Standart Temizlik',
      svc1_desc: 'Düzenli bakım için ideal. Toz alıyoruz, süpürüyoruz, paspas çekiyor ve temel alanları dezenfekte ediyoruz.',
      svc1_f1: 'Mutfak & banyolar', svc1_f2: 'Toz alma & süpürme', svc1_f3: 'Zemin paspası', svc1_f4: 'Çöp toplama',

      svc2_name: 'Derin Temizlik',
      svc2_desc: 'Evinizin ekstra ilgi ve özen gerektirdiği durumlarda baştan aşağı kapsamlı temizlik.',
      svc2_f1: 'Standart dahil her şey', svc2_f2: 'Cihaz içleri', svc2_f3: 'Süpürgelikler & hava kanalları', svc2_f4: 'Dolap içleri',

      svc3_name: 'Taşınma Temizliği',
      svc3_desc: 'Yeni evinizi taşınmadan önce pırıl pırıl yapın veya eskisini mükemmel durumda bırakın.',
      svc3_f1: 'Tüm mülk temizliği', svc3_f2: 'Duvarlar & pencereler', svc3_f3: 'Derin cihaz temizliği', svc3_f4: 'Garaj & depo',

      svc4_name: 'Ofis Temizliği',
      svc4_desc: 'Ekibinizi motive eden temiz ve profesyonel bir çalışma alanı koruyun.',
      svc4_f1: 'Masalar & çalışma istasyonları', svc4_f2: 'Mutfaklar & banyolar', svc4_f3: 'Zemin & halılar', svc4_f4: 'Atık yönetimi',

      svc5_name: 'Pencere Temizliği',
      svc5_desc: 'İç ve dış yüzeyden kristal berraklığında pencereler — leke bırakmayan profesyonel teknikler.',
      svc5_f1: 'İç & dış', svc5_f2: 'Lekesiz sonuç', svc5_f3: 'Çerçeveler & raylar', svc5_f4: 'Tüm pencere tipleri',

      svc6_name: 'Koltuk/Yatak Temizliği',
      svc6_desc: 'Koltuk ve yataklarınızı derin temizlik ve dezenfeksiyonla — leke, alerjen ve kokuları uzaklaştırıyoruz.',
      svc6_f1: 'Buhar temizleme', svc6_f2: 'Leke çıkarma', svc6_f3: 'Koku giderme', svc6_f4: 'Tüm kumaş tipleri',

      why_tag: 'Neden Bizi Seçmelisiniz',
      why_title: 'Sadece Temizlemekten Fazlasını Yapıyoruz',
      why_subtitle: 'Her işe güvenilirlik, profesyonellik ve temiz alanlara olan gerçek tutkumuzu getiriyoruz.',
      why1_title: '7/24 Hizmet',
      why1_desc: 'Programınıza göre çalışıyoruz — sabah erken, gece geç, hafta sonu. İhtiyaç duyduğunuzda her zaman buradayız.',
      why2_title: 'Tam Sigortalı & Denetimli',
      why2_desc: 'Her temizlikçi özgeçmiş kontrolünden geçmiş, eğitilmiş ve tam gönül rahatlığınız için sigortalıdır.',
      why3_title: 'Çevre Dostu Ürünler',
      why3_desc: 'Yalnızca aileniz, evcil hayvanlarınız ve gezegen için güvenli, toksik olmayan temizlik ürünleri kullanıyoruz.',
      why4_title: 'Şeffaf Fiyatlandırma',
      why4_desc: 'Gizli ücret yok. Rezervasyon sırasında gördüğünüz tam olarak ödediğiniz tutardır.',
      why_stat1: 'Yıllık Deneyim',
      why_stat2: 'Mutlu Müşteri',
      why_badge1: '✓ Sigortalı', why_badge2: '✓ Denetimli', why_badge3: '✓ Çevre Dostu',
      why_badge4: '✓ 7/24 Destek', why_badge5: '✓ Memnuniyet Garantisi',

      steps_title: 'Nasıl Çalışır',
      steps_subtitle: 'Profesyonel temizlik rezervasyonu kolaydır — 3 dakikadan az sürer.',
      step1_title: 'Bilgilerinizi Girin',
      step1_desc: 'Giriş yapın veya misafir olarak devam edin — sadece adınızı, telefonunuzu ve e-postanızı bırakın.',
      step2_title: 'Hizmet Seçin',
      step2_desc: 'İhtiyaçlarınıza uygun temizlik türünü seçin — hızlı standart temizlikten tam derin temizliğe.',
      step3_title: 'Tarih & Saat Seçin',
      step3_desc: 'Bir tarih ve tercih ettiğiniz zaman dilimini seçin. 7/24 hizmetinizdeyiz, her zaman uygundur.',
      step4_title: 'Geliyoruz & Temizliyoruz',
      step4_desc: 'Denetlenmiş profesyonel ekibimiz tüm ekipmanlarla zamanında gelir ve alanınızı tertemiz yapar.',
      steps_cta: 'Rezervasyona Başla →',

      test_title: 'Müşterilerimiz Ne Diyor',
      test_subtitle: 'Sadece bize güvenmeyin — mutlu müşterilerimizin söylediklerine bakın.',
      test1: '"Kesinlikle inanılmaz hizmet! Dairem hiç bu kadar temiz olmamıştı. Zamanında geldiler, titiz davrandılar ve her şeyi pırıl pırıl bıraktılar. Kesinlikle tekrar rezervasyon yapacağım!"',
      test1_name: 'Sarah M.',
      test1_service: 'Standart Temizlik · New York',
      test2: '"Ofis derin temizliği için Homelines\'i kullandık — ekip profesyonel ve verimli çalıştı. Bizi rahatsız etmemek için geceleri çalıştılar. 7/24 erişilebilirlik oyunu değiştiriyor."',
      test2_name: 'James R.',
      test2_service: 'Ofis Temizliği · Chicago',
      test3: '"Taşınma temizliği rezervasyonu yaptım ve çok memnun kaldım. Depozitomun tamamını geri aldım. Online rezervasyon süreci inanılmaz derecede kolay. Kesinlikle tavsiye ederim!"',
      test3_name: 'Anna K.',
      test3_service: 'Taşınma Temizliği · Los Angeles',

      cta_title: 'Tertemiz Bir Ev İçin Hazır Mısınız?',
      cta_desc: 'Temizliğinizi 3 dakikadan az sürede rezerve edin. Günde 24 saat, haftada 7 gün.',
      cta_btn1: 'Rezerve Et',
      cta_btn2: 'Bize Ulaşın',

      footer_desc: 'Günde 24 saat, haftada 7 gün profesyonel temizlik hizmetleri. Memnuniyetiniz bizim garantimizdir.',
      footer_services: 'Hizmetler',
      footer_company: 'Şirket',
      footer_contact: 'İletişim',
      footer_fl1: '→ Standart Temizlik', footer_fl2: '→ Derin Temizlik', footer_fl3: '→ Taşınma',
      footer_fl4: '→ Ofis Temizliği', footer_fl5: '→ Pencere Temizliği', footer_fl6: '→ Koltuk/Yatak Temizliği',
      footer_cl1: '→ Ana Sayfa', footer_cl2: '→ Rezervasyon', footer_cl3: '→ İletişim',
      footer_cl4: '→ Hakkımızda', footer_cl5: '→ Yorumlar',
      footer_open: '7/24 Açık — Her Zaman Müsait',
      footer_copy: '© 2025 Homelines Cleaning. Tüm hakları saklıdır.',
      footer_privacy: 'Gizlilik Politikası',
      footer_terms: 'Kullanım Şartları',

      contact_hero_title: 'İletişime Geçin',
      contact_hero_subtitle: 'Sizden haber almak isteriz. Form, telefon veya e-posta ile ulaşın — 7/24 hizmetinizdeyiz.',
      contact_form_title: 'Mesaj Gönderin',
      contact_form_subtitle: 'Formu doldurun, 1 saat içinde size geri döneceğiz.',
      contact_name: 'Ad Soyad *',
      contact_name_ph: 'Ahmet Yılmaz',
      contact_email: 'E-posta *',
      contact_email_ph: 'ahmet@ornek.com',
      contact_phone: 'Telefon',
      contact_phone_ph: '+90 (555) 000-00-00',
      contact_service: 'İlgilendiğiniz Hizmet',
      contact_service_ph: '— Bir hizmet seçin —',
      contact_message: 'Mesaj *',
      contact_message_ph: 'Temizlik ihtiyaçlarınız, mülk büyüklüğünüz, tercih ettiğiniz zamanlama hakkında bize bilgi verin...',
      contact_submit: 'Mesaj Gönder →',
      contact_success: '✓ Mesajınız başarıyla gönderildi! 1 saat içinde size ulaşacağız.',
      contact_info_title: 'İletişim Bilgileri',
      contact_hours_title: 'Çalışma Saatleri',
      contact_hours_value: '7 Gün / 24 Saat Açık',
      contact_faq_title: 'Sıkça Sorulan Sorular',

      booking_badge: 'Temizlik Rezervasyonu',
      booking_title: 'Temizlik Rezervasyonu Yap',
      booking_subtitle: 'Hızlı, kolay ve güvenli. 3 dakikadan az sürer.',
      step_label1: 'Bilgileriniz', step_label2: 'Hizmet', step_label3: 'Tarih & Saat', step_label4: 'Onay',
      auth_guest_tab: 'Misafir Olarak Devam Et',
      auth_login_tab: 'Giriş Yap',
      auth_name: 'Ad Soyad *',
      auth_name_ph: 'Ahmet Yılmaz',
      auth_email: 'E-posta *',
      auth_email_ph: 'ahmet@ornek.com',
      auth_phone: 'Telefon *',
      auth_phone_ph: '+90 (555) 000-00-00',
      auth_continue: 'Devam Et →',
      auth_login_email: 'E-posta *',
      auth_login_pass: 'Şifre *',
      auth_login_btn: 'Giriş Yap →',
      step2_title: 'Hizmet(ler) Seçin',
      step2_subtitle: 'Rezervasyonunuz için bir veya daha fazla hizmet seçin',
      step3_title: 'Tarih ve Saat Seçin',
      step4_title: 'Rezervasyonunuzu Onaylayın',
      sum_service: 'Hizmet',
      sum_date: 'Tarih',
      sum_time: 'Saat',
      sum_price: 'Toplam Fiyat',
      sum_duration: 'Süre',
      sum_name: 'Ad',
      sum_email: 'E-posta',
      sum_phone: 'Telefon',
      confirm_btn: 'Rezervasyonu Onayla →',
      booking_success_title: '🎉 Rezervasyon Onaylandı!',
      booking_success_desc: 'Teşekkürler! Rezervasyonunuz alındı. E-postanıza onay göndereceğiz ve kısa sürede sizinle iletişime geçeceğiz.',
      booking_success_btn: 'Ana Sayfaya Dön',
    },

    es: {
      nav_home: 'Inicio',
      nav_book_now: 'Reservar',
      nav_contact: 'Contacto',
      nav_book_btn: 'Reservar Limpieza',
      nav_online: 'En Línea 24/7',

      hero_badge: 'Disponible 24 Horas · 7 Días a la Semana',
      hero_title: 'Tu Hogar,',
      hero_title2: 'Perfectamente',
      hero_highlight: 'Limpio',
      hero_desc: 'Servicios de limpieza profesional adaptados a tu horario. Desde limpiezas estándar hasta desinfección profunda — devolvemos el brillo a tu espacio.',
      hero_cta1: 'Reservar Limpieza',
      hero_cta2: 'Nuestros Servicios',
      hero_stat1: 'Hogares Limpiados',
      hero_stat2: 'Tasa de Satisfacción',
      hero_stat3: 'Calificación Promedio',
      hero_card_cta: 'Reservar Online — Es Fácil →',

      services_tag: 'Lo Que Ofrecemos',
      services_title: 'Nuestros Servicios de Limpieza',
      services_subtitle: 'Desde el orden cotidiano hasta limpiezas profundas — cubrimos cada rincón de tu hogar u oficina.',
      services_cta: 'Reservar Cualquier Servicio',

      svc1_name: 'Limpieza Estándar',
      svc1_desc: 'Perfecta para el mantenimiento regular. Desempolvamos, aspiramos, fregamos y desinfectamos las áreas clave.',
      svc1_f1: 'Cocina & baños', svc1_f2: 'Quitar polvo & aspirar', svc1_f3: 'Fregar el suelo', svc1_f4: 'Recogida de basura',

      svc2_name: 'Limpieza Profunda',
      svc2_desc: 'Una limpieza exhaustiva de arriba a abajo para cuando tu hogar necesita atención y cuidado extra.',
      svc2_f1: 'Todo lo de Estándar', svc2_f2: 'Interior de electrodomésticos', svc2_f3: 'Zócalos & ventilación', svc2_f4: 'Interior de armarios',

      svc3_name: 'Mudanza',
      svc3_desc: 'Deja tu nuevo hogar impecable antes de mudarte o deja el anterior en perfectas condiciones.',
      svc3_f1: 'Limpieza completa', svc3_f2: 'Paredes & ventanas', svc3_f3: 'Limpieza profunda electrodomésticos', svc3_f4: 'Garaje & almacén',

      svc4_name: 'Limpieza de Oficinas',
      svc4_desc: 'Mantén un espacio de trabajo impecable y profesional que mantiene motivado a tu equipo.',
      svc4_f1: 'Escritorios & estaciones', svc4_f2: 'Cocinas & baños', svc4_f3: 'Suelos & alfombras', svc4_f4: 'Gestión de residuos',

      svc5_name: 'Limpieza de Ventanas',
      svc5_desc: 'Ventanas cristalinas por dentro y por fuera — técnicas profesionales sin rayas.',
      svc5_f1: 'Interior & exterior', svc5_f2: 'Sin rayas', svc5_f3: 'Marcos & rieles', svc5_f4: 'Todos los tipos',

      svc6_name: 'Limpieza de Sofás/Colchones',
      svc6_desc: 'Limpieza profunda y desinfección de sofás y colchones — eliminamos manchas, alérgenos y olores.',
      svc6_f1: 'Limpieza a vapor', svc6_f2: 'Eliminación de manchas', svc6_f3: 'Desodorización', svc6_f4: 'Todos los tejidos',

      why_tag: 'Por Qué Elegirnos',
      why_title: 'Hacemos Más Que Limpiar',
      why_subtitle: 'Aportamos fiabilidad, profesionalismo y una verdadera pasión por los espacios limpios a cada trabajo.',
      why1_title: 'Disponible 24/7',
      why1_desc: 'Trabajamos según tu horario — madrugadas, noches, fines de semana. Siempre estamos aquí cuando nos necesitas.',
      why2_title: 'Totalmente Asegurado & Verificado',
      why2_desc: 'Cada limpiador tiene antecedentes verificados, está entrenado y asegurado para tu total tranquilidad.',
      why3_title: 'Productos Ecológicos',
      why3_desc: 'Usamos solo productos de limpieza seguros y no tóxicos, buenos para tu familia, mascotas y el planeta.',
      why4_title: 'Precios Transparentes',
      why4_desc: 'Sin tarifas ocultas. Lo que ves al reservar es exactamente lo que pagas. Sin sorpresas.',
      why_stat1: 'Años de Experiencia',
      why_stat2: 'Clientes Satisfechos',
      why_badge1: '✓ Asegurado', why_badge2: '✓ Verificado', why_badge3: '✓ Ecológico',
      why_badge4: '✓ Soporte 24/7', why_badge5: '✓ Garantía de Satisfacción',

      steps_title: 'Cómo Funciona',
      steps_subtitle: 'Reservar una limpieza profesional es sencillo — toma menos de 3 minutos.',
      step1_title: 'Ingresa tus Datos',
      step1_desc: 'Inicia sesión o continúa como invitado — solo deja tu nombre, teléfono y email para confirmar.',
      step2_title: 'Elige un Servicio',
      step2_desc: 'Elige el tipo de limpieza que se adapta a tus necesidades — desde una limpieza estándar rápida hasta una profunda.',
      step3_title: 'Elige Fecha & Hora',
      step3_desc: 'Selecciona una fecha y franja horaria. Estamos disponibles 24/7, cualquier hora nos viene bien.',
      step4_title: 'Llegamos & Limpiamos',
      step4_desc: 'Nuestro equipo profesional verificado llega puntual con todo el equipo y deja tu espacio impecable.',
      steps_cta: 'Comenzar Reserva →',

      test_title: 'Lo Que Dicen Nuestros Clientes',
      test_subtitle: 'No te fíes solo de nuestra palabra — aquí está lo que dicen los clientes satisfechos.',
      test1: '"¡Servicio absolutamente increíble! Mi apartamento nunca había estado tan limpio. Llegaron puntual, fueron minuciosos y lo dejaron todo reluciente. ¡Definitivamente volveré a reservar!"',
      test1_name: 'Sarah M.',
      test1_service: 'Limpieza Estándar · Nueva York',
      test2: '"Usamos Homelines para la limpieza profunda de nuestra oficina — el equipo fue profesional y eficiente. Trabajaron de noche para no interrumpirnos. La disponibilidad 24/7 es un cambio de juego."',
      test2_name: 'James R.',
      test2_service: 'Limpieza de Oficina · Chicago',
      test3: '"Reservé la limpieza de mudanza y me alegra haberlo hecho. Recuperé el depósito completo. El proceso de reserva online es increíblemente fluido. ¡Muy recomendable!"',
      test3_name: 'Anna K.',
      test3_service: 'Limpieza de Mudanza · Los Ángeles',

      cta_title: '¿Listo para un Hogar Impecable?',
      cta_desc: 'Reserva tu limpieza en menos de 3 minutos. Disponible 24 horas al día, 7 días a la semana.',
      cta_btn1: 'Reservar Ahora',
      cta_btn2: 'Contáctanos',

      footer_desc: 'Servicios de limpieza profesional disponibles 24 horas al día, 7 días a la semana. Tu satisfacción es nuestra garantía.',
      footer_services: 'Servicios',
      footer_company: 'Empresa',
      footer_contact: 'Contacto',
      footer_fl1: '→ Limpieza Estándar', footer_fl2: '→ Limpieza Profunda', footer_fl3: '→ Mudanza',
      footer_fl4: '→ Limpieza de Oficinas', footer_fl5: '→ Limpieza de Ventanas', footer_fl6: '→ Sofás/Colchones',
      footer_cl1: '→ Inicio', footer_cl2: '→ Reservar Limpieza', footer_cl3: '→ Contacto',
      footer_cl4: '→ Sobre Nosotros', footer_cl5: '→ Reseñas',
      footer_open: 'Abierto 24/7 — Siempre Disponible',
      footer_copy: '© 2025 Homelines Cleaning. Todos los derechos reservados.',
      footer_privacy: 'Política de Privacidad',
      footer_terms: 'Términos de Servicio',

      contact_hero_title: 'Ponte en Contacto',
      contact_hero_subtitle: 'Nos encantaría saber de ti. Contáctanos por el formulario, teléfono o email — disponibles 24/7.',
      contact_form_title: 'Envíanos un Mensaje',
      contact_form_subtitle: 'Rellena el formulario y te responderemos en 1 hora.',
      contact_name: 'Nombre Completo *',
      contact_name_ph: 'Juan García',
      contact_email: 'Correo Electrónico *',
      contact_email_ph: 'juan@ejemplo.com',
      contact_phone: 'Teléfono',
      contact_phone_ph: '+34 (600) 000-000',
      contact_service: 'Servicio de Interés',
      contact_service_ph: '— Selecciona un servicio —',
      contact_message: 'Mensaje *',
      contact_message_ph: 'Cuéntanos sobre tus necesidades de limpieza, tamaño del inmueble, horario preferido...',
      contact_submit: 'Enviar Mensaje →',
      contact_success: '✓ ¡Mensaje enviado correctamente! Te contactaremos en 1 hora.',
      contact_info_title: 'Información de Contacto',
      contact_hours_title: 'Horario de Atención',
      contact_hours_value: 'Abierto 24 Horas / 7 Días a la Semana',
      contact_faq_title: 'Preguntas Frecuentes',

      booking_badge: 'Reservar Limpieza Profesional',
      booking_title: 'Reserva tu Limpieza',
      booking_subtitle: 'Rápido, fácil y seguro. Tarda menos de 3 minutos.',
      step_label1: 'Tus Datos', step_label2: 'Servicio', step_label3: 'Fecha & Hora', step_label4: 'Confirmar',
      auth_guest_tab: 'Continuar como Invitado',
      auth_login_tab: 'Iniciar Sesión',
      auth_name: 'Nombre Completo *',
      auth_name_ph: 'Juan García',
      auth_email: 'Correo Electrónico *',
      auth_email_ph: 'juan@ejemplo.com',
      auth_phone: 'Teléfono *',
      auth_phone_ph: '+34 (600) 000-000',
      auth_continue: 'Continuar →',
      auth_login_email: 'Correo Electrónico *',
      auth_login_pass: 'Contraseña *',
      auth_login_btn: 'Iniciar Sesión →',
      step2_title: 'Elige tu(s) Servicio(s)',
      step2_subtitle: 'Selecciona uno o más servicios para tu reserva',
      step3_title: 'Selecciona Fecha y Hora',
      step4_title: 'Confirma tu Reserva',
      sum_service: 'Servicio',
      sum_date: 'Fecha',
      sum_time: 'Hora',
      sum_price: 'Precio Total',
      sum_duration: 'Duración',
      sum_name: 'Nombre',
      sum_email: 'Correo',
      sum_phone: 'Teléfono',
      confirm_btn: 'Confirmar Reserva →',
      booking_success_title: '🎉 ¡Reserva Confirmada!',
      booking_success_desc: '¡Gracias! Tu reserva ha sido recibida. Te enviaremos una confirmación por email y nos pondremos en contacto contigo pronto.',
      booking_success_btn: 'Volver al Inicio',
    }
  };

  const LANG_KEY = 'hl_lang';
  const LANGS = {
    en: { flag: '🇬🇧', code: 'EN', name: 'English' },
    ru: { flag: '🇷🇺', code: 'RU', name: 'Русский' },
    tr: { flag: '🇹🇷', code: 'TR', name: 'Türkçe' },
    es: { flag: '🇪🇸', code: 'ES', name: 'Español' }
  };

  function applyLang(lang) {
    const t = translations[lang];
    if (!t) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (t[key] !== undefined) el.placeholder = t[key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) el.innerHTML = t[key];
    });
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.querySelectorAll('.lang-toggle-label').forEach(el => {
      el.textContent = LANGS[lang].flag + ' ' + LANGS[lang].code;
    });
  }

  function buildPicker() {
    const containers = document.querySelectorAll('.lang-picker');
    containers.forEach(picker => {
      const savedLang = localStorage.getItem(LANG_KEY) || 'en';
      const L = LANGS[savedLang];
      picker.innerHTML = `
        <button class="lang-toggle" aria-label="Select language">
          <span class="lang-toggle-label">${L.flag} ${L.code}</span>
          <svg class="lang-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="lang-dropdown">
          ${Object.entries(LANGS).map(([code, l]) =>
            `<button class="lang-option${code === savedLang ? ' active' : ''}" data-lang="${code}">
              <span class="lang-flag">${l.flag}</span>
              <span class="lang-name">${l.name}</span>
            </button>`
          ).join('')}
        </div>
      `;
      picker.querySelector('.lang-toggle').addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.lang-picker.open').forEach(p => { if (p !== picker) p.classList.remove('open'); });
        picker.classList.toggle('open');
      });
      picker.querySelectorAll('.lang-option').forEach(btn => {
        btn.addEventListener('click', () => {
          applyLang(btn.dataset.lang);
          picker.classList.remove('open');
        });
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.lang-picker').forEach(p => p.classList.remove('open'));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    buildPicker();
    const saved = localStorage.getItem(LANG_KEY) || 'en';
    applyLang(saved);
  });

  window.i18nApply = applyLang;
})();
