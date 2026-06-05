function renderHome() {
  const project = activeProject();
  const user = currentUser();
  const totals = calculateTotals(projectEntries());
  const recent = actualEntries().slice(0, 3);
  const upcoming = pendingEntries().slice(0, 2);
  const notificationCount = notificationEntries().length;

  return `
    <section class="account-strip">
      <div>
        <span class="field-label">Aktif kullanıcı</span>
        <strong>${projectUserLabel(user)}</strong>
      </div>
      <div class="account-actions">
        <button class="tiny-button" data-action="open-notifications" type="button">Bildirimler${notificationCount ? ` (${notificationCount})` : ""}</button>
        <button class="tiny-button" data-action="logout" type="button">Çıkış</button>
      </div>
    </section>

    <section class="hero">
      <div class="hero-row">
        <div>
          <p class="hero-title">${project.purpose}</p>
          <p class="hero-money">${money(totals.comfortable)}</p>
          <p class="hero-note">Rahat kalan: gerçek kasa + beklenenler - yaklaşanlar</p>
        </div>
        <span class="quick-pill">${totals.comfortable >= 0 ? "İyi" : "Dikkat"}</span>
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>${project.name}</h2>
          <p>${activeMembers().map((user) => projectUserLabel(user)).join(", ") || "Henüz üye yok"}</p>
        </div>
        <button class="tiny-button" data-action="open-projects-list" type="button">Yeni proje oluştur</button>
      </div>
      <label style="display:block; margin-top: 12px;">
        <span class="field-label">Aktif proje</span>
        <select class="select-input" id="projectSelect">
          ${state.projects.map((item) => `<option value="${item.id}" ${item.id === state.activeProjectId ? "selected" : ""}>${item.name}</option>`).join("")}
        </select>
      </label>
    </section>

    <section class="quick-actions">
      <button class="action-button income" data-action="go-add-income" type="button">
        <span>💰</span>
        Gelir ekle
      </button>
      <button class="action-button expense" data-action="go-add-expense" type="button">
        <span>💸</span>
        Gider ekle
      </button>
    </section>

    <section class="grid-2">
      <article class="stat-card">
        <p class="stat-label">Giren</p>
        <p class="stat-value positive">${money(totals.income)}</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Çıkan</p>
        <p class="stat-value warning">${money(totals.expense)}</p>
      </article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="receivable">
        <p class="stat-label">Beklenen</p>
        <p class="stat-value">${money(totals.receivable)}</p>
      </article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="payable">
        <p class="stat-label">Yaklaşan</p>
        <p class="stat-value">${money(totals.payable)}</p>
      </article>
    </section>

    ${
      state.pendingDetail
        ? `
          <section class="card">
            <div class="section-head">
              <div>
                <h2>${state.pendingDetail === "receivable" ? "Beklenen gelirler" : "Yaklaşan ödemeler"}</h2>
                <p>${state.pendingDetail === "receivable" ? "Şu gelecek." : "Bu gidecek."}</p>
              </div>
              <button class="tiny-button" data-action="hide-pending-detail" type="button">Kapat</button>
            </div>
            <div class="expense-list">${pendingDetailRows(state.pendingDetail)}</div>
          </section>
        `
        : ""
    }

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Yaklaşanlar</h2>
          <p>Ödeme hatırlatıcıları burada görünür.</p>
        </div>
        <button class="tiny-button" data-action="go-add-payable" type="button">Ekle</button>
      </div>
      <div class="expense-list">
        ${upcoming.length ? upcoming.map(pendingRow).join("") : `<div class="empty-state">Henüz beklenen alacak veya yaklaşan ödeme yok.</div>`}
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Son hareketler</h2>
          <p>Detay ve oyun sonucu için tümünü aç.</p>
        </div>
        <button class="tiny-button" data-action="open-movements" type="button">Tümü</button>
      </div>
      <div class="expense-list">
        ${recent.length ? recent.map(entryRow).join("") : `<div class="empty-state">Kasa boş. İlk hareketi ekleyerek başlayalım.</div>`}
      </div>
    </section>
  `;
}

function renderAdd() {
  const type = entryTypes.find((item) => item.id === draft.type) || entryTypes[0];
  const members = activeMembers();
  const suggestions = headingSuggestionsFor(type.id);
  const emojiOptions = emojiOptionsFor(type.id);
  const amountValue = draft.amountInput || "";
  const entryUser = currentUser() || members[0];
  const dateLabel = {
    expense: "Gider tarihi",
    income: "Gelir tarihi",
    receivable: "Beklenen gelir tarihi",
    payable: "Beklenen ödeme tarihi",
  }[type.id];
  const typeGuidance = {
    expense: "Para çıktıysa gider. İleri tarihli ödemeyi Takvim için Ödeme olarak gir.",
    income: "Para yattıysa gelir. Maaş yatacaksa Alacak seçip beklenen tarihi yaz.",
    receivable: "Henüz yatmamış gelir. Takvimde beklenen para olarak görünür.",
    payable: "Henüz ödenmemiş gider. Takvimde yaklaşan ödeme olarak görünür.",
  }[type.id];
  const headingLabel = type.id === "income" || type.id === "receivable" ? "Gelir başlığı" : "Gider başlığı";
  const headingPlaceholder = "Başlık yaz";
  const shortPlaceholder = "Kısa isim";
  const notePlaceholder = "Açıklama";
  return `
    <form class="form-card form-grid" id="entryForm">
      <div class="section-head">
        <div>
          <h2>${type.label} hareketi ekle</h2>
          <p>${activeProject().name} içine kayıt düşer.</p>
        </div>
      </div>

      <div class="type-grid">
        ${entryTypes.map((item) => `<button class="type-chip ${draft.type === item.id ? "selected" : ""}" data-entry-type="${item.id}" type="button"><span>${item.emoji}</span>${item.label}</button>`).join("")}
      </div>
      <p class="field-help">${typeGuidance}</p>
      <input type="hidden" name="userId" value="${entryUser?.id || ""}" />

      <div>
        <label class="field-label" for="amount">Tutar</label>
        <input class="amount-input" id="amount" name="amount" inputmode="numeric" placeholder="1.000" value="${amountValue}" autocomplete="off" />
      </div>

      <div class="grid-2 currency-grid ${draft.currency === "TRY" ? "single" : ""}">
        <label>
          <span class="field-label">Para birimi</span>
          <select class="select-input" name="currency">
            ${currencyOptions.map((item) => `<option value="${item.code}" ${draft.currency === item.code ? "selected" : ""}>${item.label}</option>`).join("")}
          </select>
        </label>
        <label class="fx-rate-field ${draft.currency === "TRY" ? "is-hidden" : ""}">
          <span class="field-label">Kur</span>
          <input class="select-input" name="exchangeRate" inputmode="decimal" placeholder="32,50" value="${draft.exchangeRate || 1}" autocomplete="off" />
        </label>
      </div>

      <div class="grid-2 timing-grid ${type.id === "expense" ? "" : "single"}">
        <label>
          <span class="field-label">${dateLabel}</span>
          <input class="select-input" name="date" type="date" value="${draft.date || todayKey()}" />
          <span class="field-help">Maaş her ayın 1'inde yatıyorsa o günü seç.</span>
        </label>
        ${
          type.id === "expense"
            ? `
              <label>
                <span class="field-label">Hesaplaşma</span>
                <select class="select-input" name="settlement">
                  <option value="in" ${draft.settlement === "in" ? "selected" : ""}>Dahil</option>
                  <option value="out" ${draft.settlement === "out" ? "selected" : ""}>Dahil değil</option>
                </select>
              </label>
            `
            : `<input type="hidden" name="settlement" value="out" />`
        }
      </div>

      <div>
        <label class="field-label" for="headingName">${headingLabel}</label>
        <input class="text-input" id="headingName" name="headingName" placeholder="${headingPlaceholder}" autocomplete="off" />
      </div>

      <div>
        <label class="field-label" for="shortName">Kısa isim / lakap</label>
        <input class="text-input" id="shortName" name="shortName" placeholder="${shortPlaceholder}" autocomplete="off" />
      </div>

      <div>
        <span class="field-label">Öneriler</span>
        <div class="chips">
          ${suggestions.map((item) => `<button class="chip" data-suggestion="${item.name}" data-short="${item.shortName}" data-emoji="${item.emoji}" type="button">${item.emoji} ${item.name}</button>`).join("")}
        </div>
      </div>

      <div>
        <span class="field-label">Emoji</span>
        <div class="chips">
          ${emojiOptions
            .map((emoji) => `<button class="emoji-chip ${draft.emoji === emoji ? "selected" : ""}" data-chip="emoji" data-value="${emoji}" type="button">${emoji}</button>`)
            .join("")}
        </div>
      </div>

      ${
        ["income", "expense"].includes(type.id)
          ? `
            <details class="soft-details">
              <summary>Bildirim oyunu</summary>
              <div class="form-grid notification-options">
                <label>
                  <span class="field-label">Bildirim modu</span>
                  <select class="select-input" name="notificationMode">
                    <option value="open" ${draft.notificationMode === "open" ? "selected" : ""}>Açık bildir</option>
                    <option value="surprise" ${draft.notificationMode === "surprise" ? "selected" : ""}>Sürpriz tahmin</option>
                    <option value="silent" ${draft.notificationMode === "silent" ? "selected" : ""}>Sessiz kaydet</option>
                  </select>
                </label>
                <div class="media-picker">
                  <div>
                    <span class="field-label">Bildirim medyası</span>
                    <p class="field-help">Emoji, GIF/sticker linki veya fotoğraf aynı mesaj alanı gibi çalışır.</p>
                  </div>
                  <div class="media-grid">
                    <label>
                      <span class="field-label">Emoji</span>
                      <input class="text-input" name="notificationEmoji" maxlength="4" value="${draft.notificationEmoji || "🎲"}" autocomplete="off" />
                    </label>
                    <label>
                      <span class="field-label">GIF / sticker</span>
                      <input class="text-input" name="notificationGif" placeholder="Link veya kısa ad" value="${draft.notificationGif || ""}" autocomplete="off" />
                    </label>
                    <label class="photo-pick compact-pick">
                      <span>Fotoğraf</span>
                      <strong>Seç</strong>
                      <input name="notificationPhoto" type="file" accept="image/*" />
                    </label>
                  </div>
                </div>
                <div class="media-picker">
                  <div>
                    <span class="field-label">Tahmin sonrası tepkiler</span>
                    <p class="field-help">Doğru ve yanlış cevap için ayrı medya seçilebilir.</p>
                  </div>
                  <div class="reaction-grid">
                    <div class="reaction-column">
                      <strong>Doğru</strong>
                      <input class="text-input" name="successReaction" value="${draft.successReaction || "✅"}" autocomplete="off" />
                      <input class="text-input" name="successGif" placeholder="GIF / sticker linki" value="${draft.successGif || ""}" autocomplete="off" />
                      <label class="photo-pick compact-pick">
                        <span>Fotoğraf</span>
                        <strong>Seç</strong>
                        <input name="successPhoto" type="file" accept="image/*" />
                      </label>
                    </div>
                    <div class="reaction-column">
                      <strong>Yanlış</strong>
                      <input class="text-input" name="failReaction" value="${draft.failReaction || "🙃"}" autocomplete="off" />
                      <input class="text-input" name="failGif" placeholder="GIF / sticker linki" value="${draft.failGif || ""}" autocomplete="off" />
                      <label class="photo-pick compact-pick">
                        <span>Fotoğraf</span>
                        <strong>Seç</strong>
                        <input name="failPhoto" type="file" accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          `
          : `<input type="hidden" name="notificationMode" value="silent" />`
      }

      <label>
        <span class="field-label">Not (opsiyonel)</span>
        <input class="text-input" name="note" placeholder="${notePlaceholder}" autocomplete="off" />
        <span class="field-help">Hesaba katılmaz; sadece hareketin açıklaması olarak saklanır.</span>
      </label>

      <label class="photo-pick">
        <span>Fiş, belge veya ürün fotoğrafı ekle (opsiyonel)</span>
        <strong>Seç</strong>
        <input id="photoInput" name="photo" type="file" accept="image/*" />
      </label>

      <button class="primary-button" type="submit">Kaydet</button>
    </form>
  `;
}

function renderMovements() {
  const period = state.movementPeriod || "month";
  const entries = actualEntries().filter((entry) => isInPeriod(entry.date, period));
  const totals = calculateTotals(entries);
  const label = periodLabel(period);

  return `
    <section class="segmented segmented-four">
      ${[
        ["day", "Gün"],
        ["week", "Hafta"],
        ["month", "Ay"],
        ["all", "Tümü"],
      ].map(([value, labelText]) => `<button class="segment ${period === value ? "active" : ""}" data-movement-period="${value}" type="button">${labelText}</button>`).join("")}
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>${label} hareketleri</h2>
          <p>Görünen kayıtlar, tamamlanan tahmin oyunlarına göre hesaplanır.</p>
        </div>
        <span class="quick-pill">${entries.length} kayıt</span>
      </div>
      <div class="grid-2 compact-stats">
        <article class="stat-card small">
          <p class="stat-label">Giren</p>
          <p class="stat-value positive">${money(totals.income)}</p>
        </article>
        <article class="stat-card small">
          <p class="stat-label">Çıkan</p>
          <p class="stat-value warning">${money(totals.expense)}</p>
        </article>
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Detay</h2>
          <p>Fotoğraf, not, döviz ve oyun sonucu burada görünür.</p>
        </div>
      </div>
      <div class="expense-list">
        ${entries.length ? entries.map(movementEntryRow).join("") : `<div class="empty-state">Bu dönem için görünen hareket yok.</div>`}
      </div>
    </section>
  `;
}

function renderCalendar() {
  const pending = pendingEntries();
  const actual = actualEntries().slice(0, 6);

  return `
    <section class="card">
      <div class="section-head">
        <div>
          <h2>Takvim</h2>
          <p>Beklenen alacaklar ve yaklaşan ödemeler.</p>
        </div>
        <button class="tiny-button" data-action="go-add-payable" type="button">Ekle</button>
      </div>
      <div class="expense-list">
        ${pending.length ? pending.map(pendingRow).join("") : `<div class="empty-state">Takvim boş. Kira, MTV, müşteri ödemesi gibi şeyleri ekleyebilirsin.</div>`}
      </div>
    </section>

    <section class="card">
      <h2>Son tarihli kayıtlar</h2>
      <div class="expense-list">
        ${actual.length ? actual.map(entryRow).join("") : `<div class="empty-state">Gerçekleşmiş kayıt yok.</div>`}
      </div>
    </section>
  `;
}

function renderNotifications() {
  const notifications = notificationEntries();
  return `
    <section class="card">
      <div class="section-head">
        <div>
          <h2>Bildirimler</h2>
          <p>Bu ekranda sadece bu profile gelen proje bildirimleri görünür.</p>
        </div>
        <span class="quick-pill">${notifications.length}</span>
      </div>
      <div class="expense-list">
        ${notifications.length ? notifications.map(notificationRow).join("") : `<div class="empty-state">Şu an bu profile gelen bildirim yok.</div>`}
      </div>
    </section>
  `;
}

function renderReport() {
  const period = state.reportPeriod;
  const entries = actualEntries().filter((entry) => isInPeriod(entry.date, period));
  const totals = calculateTotals(entries);
  const label = periodLabel(period);
  const netClass = totals.actual >= 0 ? "positive" : "warning";

  return `
    <section class="segmented">
      ${[
        ["day", "Gün"],
        ["week", "Hafta"],
        ["month", "Ay"],
      ].map(([value, labelText]) => `<button class="segment ${period === value ? "active" : ""}" data-period="${value}" type="button">${labelText}</button>`).join("")}
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>${label} raporu</h2>
          <p>Giren ${money(totals.income)}, çıkan ${money(totals.expense)}, net ${money(totals.actual)}.</p>
        </div>
        <span class="quick-pill">${entries.length} kayıt</span>
      </div>
      <div class="grid-2 compact-stats">
        <article class="stat-card small">
          <p class="stat-label">Giren</p>
          <p class="stat-value positive">${money(totals.income)}</p>
        </article>
        <article class="stat-card small">
          <p class="stat-label">Çıkan</p>
          <p class="stat-value warning">${money(totals.expense)}</p>
        </article>
        <article class="stat-card small">
          <p class="stat-label">Net</p>
          <p class="stat-value ${netClass}">${money(totals.actual)}</p>
        </article>
        <article class="stat-card small">
          <p class="stat-label">Ortalama</p>
          <p class="stat-value">${money(entries.length ? totals.expense / entries.length : 0)}</p>
        </article>
      </div>
      <div class="bars" style="margin-top: 16px;">
        ${headingBars(entries)}
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Rapor detayı</h2>
          <p>Bu dönemde görünen gelir ve giderler.</p>
        </div>
      </div>
      <div class="expense-list">
        ${entries.length ? entries.map(movementEntryRow).join("") : `<div class="empty-state">Bu dönem için raporlanacak hareket yok.</div>`}
      </div>
    </section>

    <section class="receipt-card">
      <h2 class="receipt-title">KASA FİŞİ</h2>
      <div class="receipt-line"><span>${label} giren</span><strong>${money(totals.income)}</strong></div>
      <div class="receipt-line"><span>${label} çıkan</span><strong>${money(totals.expense)}</strong></div>
      <div class="receipt-line"><span>Net</span><strong>${money(totals.actual)}</strong></div>
      ${exchangeReceiptLines(entries)}
      <div class="receipt-line"><span>En hareketli başlık</span><strong>${topHeading(entries)}</strong></div>
      <p class="receipt-comment">${entries.length ? "Kasa konuştu, fiş çıktı." : "Kasa bugün sessiz."}</p>
      <button class="share-button" data-action="share-receipt" type="button">Fişi paylaş</button>
    </section>
  `;
}

function renderGroup() {
  const project = activeProject();
  const balances = calculateBalances();
  const transactions = simplifyDebts(balances);
  const canManageUsers = isProjectOwner(project);
  const owner = projectOwner(project);
  const user = currentUser();
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();

  return `
    <section class="card">
      <div class="section-head">
        <div>
          <h2>Projelerim</h2>
          <p>Proje seç, üyeleri bağla, gelir/gider senaryosunu kur.</p>
        </div>
      </div>
      <div class="quick-actions compact">
        <button class="action-button income" data-action="go-add-income" type="button">
          <span>💰</span>
          Gelir ekle
        </button>
        <button class="action-button expense" data-action="go-add-expense" type="button">
          <span>💸</span>
          Gider ekle
        </button>
      </div>
      <div class="expense-list" style="margin-top:12px;">
        ${state.projects.map(projectRow).join("")}
      </div>
      <form class="inline-form" id="projectForm">
        <input class="text-input" name="projectName" placeholder="Yeni proje adı" autocomplete="off" />
        <input class="text-input" name="purpose" list="purposeList" placeholder="Kasa amacı: Ev, iş, araç..." autocomplete="off" />
        <datalist id="purposeList">
          ${purposeOptions.map((purpose) => `<option value="${purpose}"></option>`).join("")}
        </datalist>
        <button class="primary-button" type="submit">Proje ekle</button>
      </form>
      ${
        cloudReady
          ? `
            <form class="inline-form cloud-join-card" id="joinProjectForm">
              <input class="text-input" name="projectCode" placeholder="Kasa kodu: KASA-EVK-1234" autocomplete="off" />
              <button class="secondary-button" type="submit">Kodla katıl</button>
            </form>
          `
          : ""
      }
    </section>

    <section class="card">
      <h2>Projeye kişi ekle</h2>
      <p>${
        canManageUsers
          ? cloudReady
            ? `Diğer kişi önce kendi telefonunda e-posta ile hesap açsın. Sonra e-postasını buraya yazıp ${project.name} kasasına ekle.`
            : `Önce diğer profili oluştur. Sonra adını buraya yazıp ${project.name} kasasına ekle.`
          : `Şu an ${projectUserLabel(user)} hesabındasın. Kullanıcı eklemek için ${projectUserLabel(owner)} hesabıyla giriş yap.`
      }</p>
      ${
        canManageUsers
          ? `
            <form class="inline-form featured-form" id="projectUserForm">
              <input class="text-input" name="userName" placeholder="${cloudReady ? "mail@ornek.com" : "Kullanıcı adı"}" autocomplete="${cloudReady ? "email" : "off"}" />
              <button class="primary-button" type="submit">Kasaya ekle</button>
            </form>
          `
          : `
            <div class="inline-form featured-form">
              <button class="secondary-button" data-action="logout" type="button">Çıkış yap</button>
              <span class="field-help">Sonra kasa sahibi profiliyle tekrar giriş yap.</span>
            </div>
          `
      }
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Sonraki aşama: proje erişimi</h2>
          <p>${cloudReady ? "Bu kodu başka telefondaki kullanıcı girerse aynı kasaya katılır." : "Bu denemede katılımı manuel profil ekleyerek yapıyoruz. Kod/link modeli gerçek çoklu telefon sürümüne kalacak."}</p>
        </div>
      </div>
      <div class="invite-box">
        <div>
          <span class="field-label">Kod</span>
          <strong>${projectCode(project)}</strong>
          <p>${inviteLink(project)}</p>
        </div>
        <button class="mini-action" data-action="copy-project-link" type="button">Kopyala</button>
      </div>
    </section>

    <section class="card">
      <h2>Kasa kullanıcıları</h2>
      <p>${
        canManageUsers
          ? `Kasa sahibi ${projectUserLabel(owner)}. Kullanıcı adını yazıp bu kasaya ekleyebilir.`
          : `Bu kasayı ${projectUserLabel(owner)} yönetir. Kullanıcı ekleme sadece onda.`
      }</p>
      <div class="expense-list" style="margin-top:12px;">
        ${state.users.map(userLinkRow).join("")}
      </div>
      ${
        canManageUsers
          ? `
            <form class="inline-form" id="userForm">
              <input class="text-input" name="userName" placeholder="${cloudReady ? "E-posta: mail@ornek.com" : "Kullanıcı adı"}" autocomplete="${cloudReady ? "email" : "off"}" />
              <button class="primary-button" type="submit">Kasaya ekle</button>
            </form>
          `
          : `<div class="empty-state" style="margin-top:12px;">Kullanıcı eklemek için kasa sahibi hesabıyla giriş yap.</div>`
      }
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Borç & alacak</h2>
          <p>${state.settlementVisible ? "Hesaplaşma görünür." : "Şu an gizli. Ev huzuru modu."}</p>
        </div>
        <button class="tiny-button" data-action="toggle-settlement" type="button">${state.settlementVisible ? "Gizle" : "Göster"}</button>
      </div>
      ${
        state.settlementVisible
          ? `
            <div style="margin-top: 10px;">
              ${balances.length ? balances.map(balanceRow).join("") : `<div class="empty-state">Hesaplaşmaya dahil gider yok.</div>`}
            </div>
            <div style="margin-top: 12px;">
              ${
                transactions.length
                  ? transactions.map((tx) => `<div class="split-row"><strong>${tx.from} → ${tx.to}</strong><span>${money(tx.amount)}</span></div>`).join("")
                  : `<div class="empty-state">Şimdilik hesap kapanmış görünüyor.</div>`
              }
            </div>
          `
          : `<div class="empty-state" style="margin-top: 12px;">Açınca seçili projede kim kime ne kadar göndermeli görünür.</div>`
      }
    </section>
  `;
}

function renderHeadings() {
  return `
    <section class="form-card form-grid">
      <div class="section-head">
        <div>
          <h2>Başlık ekle</h2>
          <p>Resmi ad başka, proje içi lakabı başka olabilir.</p>
        </div>
      </div>

      <form class="form-grid" id="headingForm">
        <label>
          <span class="field-label">Başlık adı</span>
          <input class="text-input" name="headingName" placeholder="Başlık" autocomplete="off" />
        </label>
        <label>
          <span class="field-label">Kısa isim / lakap</span>
          <input class="text-input" name="shortName" placeholder="Kısa isim" autocomplete="off" />
        </label>
        <div>
          <span class="field-label">Emoji</span>
          <div class="chips">
            ${["🛒", "🏠", "⛽", "🚗", "💡", "🪙", "🍼", "🏖️", "💼", "🧾"]
              .map((emoji) => `<button class="emoji-chip ${draft.emoji === emoji ? "selected" : ""}" data-chip="emoji" data-value="${emoji}" type="button">${emoji}</button>`)
              .join("")}
          </div>
        </div>
        <button class="primary-button" type="submit">Başlığı kaydet</button>
      </form>
    </section>

    <section class="card">
      <h2>${activeProject().name} başlıkları</h2>
      <div class="expense-list">
        ${projectHeadings().length ? projectHeadings().map(headingRow).join("") : `<div class="empty-state">Henüz başlık yok.</div>`}
      </div>
    </section>
  `;
}
