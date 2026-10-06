(function() {

    /* =====================================================================
       ANTI-DEBUG PROTECTION
       ===================================================================== */
    setInterval(function() {
        const before = new Date().getTime();
        debugger;
        const after = new Date().getTime();
        if (after - before > 100) {
            document.body.innerHTML = '<div style="text-align:center;padding:50px;font-family:Arial;">Access Denied - Accès Refusé - تم رفض الوصول</div>';
        }
    }, 1000);

    /* =====================================================================
       CONFIGURATION
       ===================================================================== */
    const WORKER_URL = 'https://empty-grass-e190.05juillet-ballouh-info-8e2.workers.dev/api/doctors';
    const DME_GRADE_VALUES = [
        'Médecin généraliste de santé publique',
        'Médecin généraliste principal de santé publique',
        'Médecin généraliste en chef de santé publique'
    ];

    /* =====================================================================
       MOTIVATIONAL BANNER
       ===================================================================== */
    const DME_motivationalMessages = [
        { fr: "Vos informations contribuent à la numérisation de la santé", ar: "معلوماتك تساهم في رقمنة قطاع الصحة" },
        { fr: "Merci de faire partie de la transformation digitale", ar: "شكرًا لكونك جزءًا من التحول الرقمي" },
        { fr: "Chaque donnée collectée améliore nos services", ar: "كل بيان يتم جمعه يُحسّن خدماتنا" },
        { fr: "Votre professionnalisme construit l'avenir", ar: "احترافيتك تبني المستقبل" },
        { fr: "Ensemble, modernisons notre système de santé", ar: "معًا، لنُحدّث نظامنا الصحي" },
        { fr: "La qualité des soins commence par de bonnes données", ar: "جودة الرعاية تبدأ ببيانات دقيقة" }
    ];

    let DME_currentMessageIndex = 0;
    const DME_motivationText   = document.getElementById('DME-motivationText');
    const DME_motivationTextAr = document.getElementById('DME-motivationTextAr');
    const DME_motivationBanner = document.getElementById('DME-motivationBanner');

    function DME_updateMotivationalMessage() {
        if (!DME_motivationText || !DME_motivationTextAr) return;

        DME_motivationText.style.opacity = '0';
        DME_motivationTextAr.style.opacity = '0';
        DME_motivationText.style.transform = 'translateY(-20px)';
        DME_motivationTextAr.style.transform = 'translateY(-20px)';

        setTimeout(function() {
            const message = DME_motivationalMessages[DME_currentMessageIndex];
            DME_motivationText.textContent = message.fr;
            DME_motivationTextAr.textContent = message.ar;

            DME_motivationText.style.transition = 'all 0.5s ease';
            DME_motivationTextAr.style.transition = 'all 0.5s ease';
            DME_motivationText.style.opacity = '1';
            DME_motivationTextAr.style.opacity = '1';
            DME_motivationText.style.transform = 'translateY(0)';
            DME_motivationTextAr.style.transform = 'translateY(0)';

            DME_currentMessageIndex = (DME_currentMessageIndex + 1) % DME_motivationalMessages.length;
        }, 500);
    }

    DME_updateMotivationalMessage();
    setInterval(DME_updateMotivationalMessage, 5000);

    /* =====================================================================
       DOM REFERENCES
       ===================================================================== */
    const DME_feedbackForm = document.getElementById('DME-feedbackForm');
    const DME_submitBtn    = document.getElementById('DME-submitBtn');
    const DME_btnTextFr    = document.getElementById('DME-btnText_fr');
    const DME_btnTextAr    = document.getElementById('DME-btnText_ar');
    const DME_btnSpinner   = document.getElementById('DME-btnSpinner');
    const DME_successAlert = document.getElementById('DME-successAlert');
    const DME_errorAlert   = document.getElementById('DME-errorAlert');

    const DF_nom     = document.getElementById('DF-nom');
    const DF_prenom  = document.getElementById('DF-prenom');
    const DF_grade   = document.getElementById('DF-grade');
    const DF_nin     = document.getElementById('DF-nin');
    const DF_nss     = document.getElementById('DF-nss');
    const DF_phone   = document.getElementById('DF-phone');
    const DF_email   = document.getElementById('DF-email');
    const DF_website = document.getElementById('DF-website');

    if (!DME_feedbackForm) {
        console.error('DME-feedbackForm introuvable dans le DOM.');
        return;
    }

    /* =====================================================================
       HELPERS
       ===================================================================== */
    function DF_escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function DF_setError(field, errId, message) {
        const fg = document.getElementById('DF-fg-' + field);
        const el = document.getElementById(errId);
        if (!fg || !el) return;
        if (message) {
            fg.classList.add('DF-has-error');
            el.textContent = message;
            el.classList.add('show');
        } else {
            fg.classList.remove('DF-has-error');
            el.textContent = '';
            el.classList.remove('show');
        }
    }

    function DF_clearAllErrors() {
        ['nom', 'prenom', 'grade', 'nin', 'nss', 'phone', 'email']
            .forEach(function(f) { DF_setError(f, 'DF-err-' + f, ''); });
    }

    /* =====================================================================
       STRICT INPUT FILTERS
       ===================================================================== */

    /* -- Letters only (Arabic OR Latin), with spaces, hyphens, apostrophes -- */
    const DF_NAME_ALLOWED      = /[\p{Script=Arabic}\p{Script=Latin}\s'’\-]/u;
    const DF_NAME_DISALLOWED_G = /[^\p{Script=Arabic}\p{Script=Latin}\s'’\-]/gu;

    function DF_attachNameFilter(el) {
        if (!el) return;
        el.addEventListener('beforeinput', function(e) {
            if (e.data && !DF_NAME_ALLOWED.test(e.data)) e.preventDefault();
        });
        el.addEventListener('input', function() {
            const cleaned = el.value.replace(DF_NAME_DISALLOWED_G, '').replace(/\s{2,}/g, ' ');
            if (cleaned !== el.value) el.value = cleaned;
        });
        el.addEventListener('paste', function(e) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text');
            const cleaned = (text || '').replace(DF_NAME_DISALLOWED_G, '');
            document.execCommand('insertText', false, cleaned);
        });
    }

    /* -- Digits only -- */
    function DF_attachDigitsFilter(el, maxLen) {
        if (!el) return;
        el.addEventListener('beforeinput', function(e) {
            if (e.data && /\D/.test(e.data)) e.preventDefault();
        });
        el.addEventListener('input', function() {
            const cleaned = el.value.replace(/\D/g, '');
            const sliced  = maxLen ? cleaned.slice(0, maxLen) : cleaned;
            if (sliced !== el.value) el.value = sliced;
        });
        el.addEventListener('paste', function(e) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text') || '';
            const digits = text.replace(/\D/g, '');
            const sliced = maxLen ? digits.slice(0, maxLen) : digits;
            document.execCommand('insertText', false, sliced);
        });
    }

    /* -- Phone: digits + + ( ) - space -- */
    const DF_PHONE_ALLOWED      = /[\d+\s\-()]/;
    const DF_PHONE_DISALLOWED_G = /[^\d+\s\-()]/g;

    function DF_attachPhoneFilter(el) {
        if (!el) return;
        el.addEventListener('beforeinput', function(e) {
            if (e.data && !DF_PHONE_ALLOWED.test(e.data)) e.preventDefault();
        });
        el.addEventListener('input', function() {
            const cleaned = el.value.replace(DF_PHONE_DISALLOWED_G, '');
            if (cleaned !== el.value) el.value = cleaned;
        });
        el.addEventListener('paste', function(e) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text') || '';
            document.execCommand('insertText', false, text.replace(DF_PHONE_DISALLOWED_G, ''));
        });
    }

    /* -- Email: latin letters, digits, @ . _ - + % -- */
    const DF_EMAIL_ALLOWED      = /[a-zA-Z0-9@._+\-%]/;
    const DF_EMAIL_DISALLOWED_G = /[^a-zA-Z0-9@._+\-%]/g;

    function DF_attachEmailFilter(el) {
        if (!el) return;
        el.addEventListener('beforeinput', function(e) {
            if (e.data && !DF_EMAIL_ALLOWED.test(e.data)) e.preventDefault();
        });
        el.addEventListener('input', function() {
            const cleaned = el.value.replace(DF_EMAIL_DISALLOWED_G, '');
            if (cleaned !== el.value) el.value = cleaned;
        });
        el.addEventListener('paste', function(e) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text') || '';
            document.execCommand('insertText', false, text.replace(DF_EMAIL_DISALLOWED_G, ''));
        });
    }

    /* Apply filters */
    DF_attachNameFilter(DF_nom);
    DF_attachNameFilter(DF_prenom);
    DF_attachDigitsFilter(DF_nin, 18);
    DF_attachDigitsFilter(DF_nss, 15);
    DF_attachPhoneFilter(DF_phone);
    DF_attachEmailFilter(DF_email);

    /* =====================================================================
       VALIDATION
       ===================================================================== */
    const DF_NAME_REGEX = /^[\p{Script=Arabic}\p{Script=Latin}][\p{Script=Arabic}\p{Script=Latin}\s'’\-]*$/u;

    function DF_validate() {
        DF_clearAllErrors();
        let ok = true;
        let firstInvalid = null;

        /* Nom */
        const nom = DF_nom.value.trim().replace(/\s+/g, ' ');
        if (!nom) {
            DF_setError('nom', 'DF-err-nom', 'Ce champ est obligatoire — هذا الحقل مطلوب');
            ok = false; firstInvalid = firstInvalid || 'DF-nom';
        } else if (nom.length < 2) {
            DF_setError('nom', 'DF-err-nom', 'Nom trop court (min. 2 caractères)');
            ok = false; firstInvalid = firstInvalid || 'DF-nom';
        } else if (nom.length > 60) {
            DF_setError('nom', 'DF-err-nom', 'Nom trop long (max. 60 caractères)');
            ok = false; firstInvalid = firstInvalid || 'DF-nom';
        } else if (!DF_NAME_REGEX.test(nom)) {
            DF_setError('nom', 'DF-err-nom', 'Lettres arabes ou latines uniquement — حروف عربية أو فرنسية فقط');
            ok = false; firstInvalid = firstInvalid || 'DF-nom';
        }

        /* Prénom */
        const prenom = DF_prenom.value.trim().replace(/\s+/g, ' ');
        if (!prenom) {
            DF_setError('prenom', 'DF-err-prenom', 'Ce champ est obligatoire — هذا الحقل مطلوب');
            ok = false; firstInvalid = firstInvalid || 'DF-prenom';
        } else if (prenom.length < 2) {
            DF_setError('prenom', 'DF-err-prenom', 'Prénom trop court (min. 2 caractères)');
            ok = false; firstInvalid = firstInvalid || 'DF-prenom';
        } else if (prenom.length > 60) {
            DF_setError('prenom', 'DF-err-prenom', 'Prénom trop long (max. 60 caractères)');
            ok = false; firstInvalid = firstInvalid || 'DF-prenom';
        } else if (!DF_NAME_REGEX.test(prenom)) {
            DF_setError('prenom', 'DF-err-prenom', 'Lettres arabes ou latines uniquement — حروف عربية أو فرنسية فقط');
            ok = false; firstInvalid = firstInvalid || 'DF-prenom';
        }

        /* Grade */
        const grade = DF_grade.value;
        if (!grade) {
            DF_setError('grade', 'DF-err-grade', 'Veuillez sélectionner un grade — يرجى اختيار الرتبة');
            ok = false; firstInvalid = firstInvalid || 'DF-grade';
        } else if (DME_GRADE_VALUES.indexOf(grade) === -1) {
            DF_setError('grade', 'DF-err-grade', 'Grade invalide — رتبة غير صحيحة');
            ok = false; firstInvalid = firstInvalid || 'DF-grade';
        }

        /* NIN */
        const nin = DF_nin.value.replace(/\D/g, '');
        if (!nin) {
            DF_setError('nin', 'DF-err-nin', 'Ce champ est obligatoire — هذا الحقل مطلوب');
            ok = false; firstInvalid = firstInvalid || 'DF-nin';
        } else if (nin.length !== 18) {
            DF_setError('nin', 'DF-err-nin', 'Le NIN doit contenir 18 chiffres (actuel : ' + nin.length + ')');
            ok = false; firstInvalid = firstInvalid || 'DF-nin';
        }

        /* NSS (optionnel) */
        const nss = DF_nss.value.replace(/\D/g, '');
        if (nss && (nss.length < 9 || nss.length > 15)) {
            DF_setError('nss', 'DF-err-nss', 'Longueur invalide (9–15 chiffres)');
            ok = false; firstInvalid = firstInvalid || 'DF-nss';
        }

        /* Téléphone */
        const phoneRaw = DF_phone.value.trim();
        const phone = phoneRaw.replace(/[\s\-().]/g, '');
        if (!phoneRaw) {
            DF_setError('phone', 'DF-err-phone', 'Ce champ est obligatoire — هذا الحقل مطلوب');
            ok = false; firstInvalid = firstInvalid || 'DF-phone';
        } else if (!/^(\+|00)?\d{8,15}$/.test(phone)) {
            DF_setError('phone', 'DF-err-phone', 'Numéro de téléphone invalide — رقم هاتف غير صحيح');
            ok = false; firstInvalid = firstInvalid || 'DF-phone';
        }

        /* E-mail */
        const email = DF_email.value.trim();
        if (!email) {
            DF_setError('email', 'DF-err-email', 'Ce champ est obligatoire — هذا الحقل مطلوب');
            ok = false; firstInvalid = firstInvalid || 'DF-email';
        } else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
            DF_setError('email', 'DF-err-email', 'Adresse e-mail invalide — بريد إلكتروني غير صحيح');
            ok = false; firstInvalid = firstInvalid || 'DF-email';
        }

        if (firstInvalid) {
            const el = document.getElementById(firstInvalid);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(function() { el.focus({ preventScroll: true }); }, 350);
            }
        }

        return ok
            ? { nom: nom, prenom: prenom, grade: grade, nin: nin, nss: nss || null, phone: phone, email: email }
            : null;
    }

    /* =====================================================================
       SUBMIT HANDLER
       ===================================================================== */
    DME_feedbackForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        /* Honeypot anti-spam */
        if (DF_website && DF_website.value.trim() !== '') {
            return;
        }

        /* Hide previous alerts */
        if (DME_successAlert) DME_successAlert.classList.add('hidden');
        if (DME_errorAlert)   DME_errorAlert.classList.add('hidden');

        const data = DF_validate();
        if (!data) {
            alert('Veuillez corriger les champs en rouge / يرجى تصحيح الحقول المطلوبة');
            return;
        }

        /* Lock UI */
        DME_submitBtn.disabled = true;
        DME_submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
        DME_btnTextFr.textContent = 'Envoi en cours...';
        DME_btnTextAr.textContent = 'جاري الإرسال...';
        DME_btnSpinner.classList.remove('hidden');

        const payload = {
            nom: data.nom,
            prenom: data.prenom,
            full_name: data.nom + ' ' + data.prenom,
            grade: data.grade,
            nin: data.nin,
            nss: data.nss,
            phone: data.phone,
            email: data.email
        };

        try {
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            let body = {};
            try { body = await response.json(); } catch (_) { body = {}; }

            if (!response.ok) {
                const msg = body && (body.message || body.error)
                    ? (body.message || body.error)
                    : "Échec de l'envoi — فشل الإرسال";
                throw new Error(msg);
            }

            /* Build reference */
            const reference = (body.reference || body.ref || body.id)
                ? String(body.reference || body.ref || body.id)
                : 'DOC-' + Date.now().toString(36).toUpperCase();

            /* Success */
            DME_showSuccess(payload, reference);

            /* Update motivational banner */
            if (DME_motivationText && DME_motivationTextAr) {
                DME_motivationText.textContent = "Merci ! Vos informations ont été enregistrées !";
                DME_motivationTextAr.textContent = "شكرًا! تم تسجيل معلوماتك!";
                setTimeout(function() {
                    DME_updateMotivationalMessage();
                }, 3000);
            }

        } catch (error) {
            console.error('Submission error:', error);

            let errorMsg = error.message || 'Erreur inconnue';
            errorMsg = errorMsg.replace('Erreur:', '').trim();

            DME_showError(errorMsg);
        } finally {
            /* Unlock UI */
            DME_submitBtn.disabled = false;
            DME_submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            DME_btnTextFr.textContent = 'Envoyer la fiche';
            DME_btnTextAr.textContent = 'إرسال الاستمارة';
            DME_btnSpinner.classList.add('hidden');
        }
    });

    /* =====================================================================
       SUCCESS VIEW
       ===================================================================== */
    function DME_showSuccess(payload, reference) {
        const refBadge = document.getElementById('DF-refBadge');
        if (refBadge) refBadge.textContent = 'REF: ' + reference;

        const recap = document.getElementById('DF-recap');
        if (recap) {
            recap.innerHTML = ''
                + '<div class="flex justify-between gap-4 px-4 py-2.5 text-sm border-b border-green-200 bg-white">'
                +     '<span class="text-gray-500">Nom / اللقب</span>'
                +     '<span class="font-medium text-gray-900">' + DF_escapeHtml(payload.nom) + '</span>'
                + '</div>'
                + '<div class="flex justify-between gap-4 px-4 py-2.5 text-sm border-b border-green-200 bg-green-50">'
                +     '<span class="text-gray-500">Prénom / الاسم</span>'
                +     '<span class="font-medium text-gray-900">' + DF_escapeHtml(payload.prenom) + '</span>'
                + '</div>'
                + '<div class="flex justify-between gap-4 px-4 py-2.5 text-sm border-b border-green-200 bg-white">'
                +     '<span class="text-gray-500">Grade / الرتبة</span>'
                +     '<span class="font-medium text-gray-900 text-right">' + DF_escapeHtml(payload.grade) + '</span>'
                + '</div>'
                + '<div class="flex justify-between gap-4 px-4 py-2.5 text-sm border-b border-green-200 bg-green-50">'
                +     '<span class="text-gray-500">NIN</span>'
                +     '<span class="font-medium text-gray-900 tracking-wider" dir="ltr">' + DF_escapeHtml(payload.nin) + '</span>'
                + '</div>'
                + '<div class="flex justify-between gap-4 px-4 py-2.5 text-sm border-b border-green-200 bg-white">'
                +     '<span class="text-gray-500">NSS</span>'
                +     '<span class="font-medium text-gray-900 tracking-wider" dir="ltr">' + (payload.nss ? DF_escapeHtml(payload.nss) : '—') + '</span>'
                + '</div>'
                + '<div class="flex justify-between gap-4 px-4 py-2.5 text-sm border-b border-green-200 bg-green-50">'
                +     '<span class="text-gray-500">Téléphone</span>'
                +     '<span class="font-medium text-gray-900" dir="ltr">' + DF_escapeHtml(payload.phone) + '</span>'
                + '</div>'
                + '<div class="flex justify-between gap-4 px-4 py-2.5 text-sm bg-white">'
                +     '<span class="text-gray-500">E-mail</span>'
                +     '<span class="font-medium text-gray-900" dir="ltr">' + DF_escapeHtml(payload.email) + '</span>'
                + '</div>';
        }

        if (DME_successAlert) {
            DME_successAlert.classList.remove('hidden');
            DME_successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        /* Lock form inputs */
        DME_feedbackForm.querySelectorAll('input, select, textarea').forEach(function(el) {
            el.disabled = true;
        });
    }

    /* =====================================================================
       ERROR VIEW
       ===================================================================== */
    function DME_showError(msg) {
        const errMsgEl = document.getElementById('DF-errorMsg');
        if (errMsgEl) errMsgEl.textContent = msg;

        if (DME_errorAlert) {
            DME_errorAlert.classList.remove('hidden');
            DME_errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(function() {
                DME_errorAlert.classList.add('hidden');
            }, 8000);
        }
    }

    /* =====================================================================
       RESET (global, called from the success panel button)
       ===================================================================== */
    window.DF_reset = function() {
        DME_feedbackForm.reset();
        DF_clearAllErrors();

        DME_feedbackForm.querySelectorAll('input, select, textarea').forEach(function(el) {
            el.disabled = false;
        });

        if (DME_successAlert) DME_successAlert.classList.add('hidden');
        if (DME_errorAlert)   DME_errorAlert.classList.add('hidden');

        if (DF_nom) DF_nom.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /* =====================================================================
       LIVE ERROR CLEARING
       ===================================================================== */
    ['DF-nom', 'DF-prenom', 'DF-grade', 'DF-nin', 'DF-nss', 'DF-phone', 'DF-email']
        .forEach(function(id) {
            const el = document.getElementById(id);
            if (!el) return;
            const key = id.replace('DF-', '');
            const clear = function() {
                const fg = document.getElementById('DF-fg-' + key);
                if (fg && fg.classList.contains('DF-has-error')) {
                    DF_setError(key, 'DF-err-' + key, '');
                }
            };
            el.addEventListener('input', clear);
            el.addEventListener('change', clear);
        });

    /* =====================================================================
       SOFT SERVER REACHABILITY CHECK
       ===================================================================== */
    fetch(WORKER_URL.replace('/api/doctors', '/api/setup-status'), { method: 'GET' })
        .then(function(r) { if (!r.ok) throw new Error(); })
        .catch(function() {
            const banner = document.getElementById('DF-offline');
            if (banner) banner.classList.remove('hidden');
        });

})();
