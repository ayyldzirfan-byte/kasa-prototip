function renderHome() {
  const project = activeProject();
  const user = currentUser();
  const totals = calculateTotals(projectEntries());
  const recent = actualEntries().slice(0, 4);
  const upcoming = pendingEntries().slice(0, 3);

  return `
    <section class="account-strip">
      <div>
        <span class="field-label">Aktif kullanıcı</span>
        <strong>${shortName(user?.name || "Kullanıcı")}</strong>
        <p>Yeni profil oluşturmak için çıkış yap.</p>
      </div>
      <button class="tiny-button" data-action="logout" type="button">Çıkış yap</button>
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
          <p>${activeMembers().map((user) => shortName(user.name)).join(", ") || "Henüz üye yok"}</p>
        </div>
        <button class="tiny-button" data-action="open-group" type="button">Yönet</button>
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
      <article class="stat-card">
        <p class="stat-label">Beklenen</p>
        <p class="stat-value">${money(totals.receivable)}</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Yaklaşan</p>
        <p class="stat-value">${money(totals.payable)}</p>
      </article>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Başlıklar</h2>
          <p>${projectHeadings().length ? `${projectHeadings().length} özel başlık var.` : "Başlıkları kullanıcı belirler. Hazır kalıp yok."}</p>
        </div>
        <button class="tiny-button" data-action="open-headings" type="button">Düzenle</button>
      </div>
      ${projectHeadings().length ? headingPreview() : `<div class="empty-state" style="margin-top: 12px;">Market, kira, haraç, HGS... Kasanın dilini sen kur.</div>`}
    </section>

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
          <p>Gerçekleşen gelir ve giderler.</p>
        </div>
        <button class="tiny-button" data-action="go-add-expense" type="button">Ekle</button>
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
  const dateLabel = ["receivable", "payable"].includes(type.id) ? "Beklenen tarih" : "Tarih";
  const memberLabel = {
    expense: "Kim ödedi?",
    income: "Kim aldı?",
    receivable: "Kim bekliyor?",
    payable: "Kim ödeyecek?",
  }[type.id];

  return `
    <form class="form-card form-grid" id="entryForm">
      <div class="section-head">
        <div>
          <h2>Hareket ekle</h2>
          <p>${activeProject().name} içine kayıt düşer.</p>
        </div>
      </div>

      <div class="type-grid">
        ${entryTypes.map((item) => `<button class="type-chip ${draft.type === item.id ? "selected" : ""}" data-entry-type="${item.id}" type="button"><span>${item.emoji}</span>${item.label}</button>`).join("")}
      </div>

      <div>
        <label class="field-label" for="amount">Tutar</label>
        <input class="amount-input" id="amount" name="amount" inputmode="decimal" placeholder="0" autocomplete="off" />
      </div>

      <div class="grid-2">
        <label>
          <span class="field-label">Para birimi</span>
          <select class="select-input" name="currency">
            ${currencyOptions.map((item) => `<option value="${item.code}" ${draft.currency === item.code ? "selected" : ""}>${item.label}</option>`).join("")}
          </select>
        </label>
        <label>
          <span class="field-label">Kur</span>
          <input class="select-input" name="exchangeRate" inputmode="decimal" placeholder="TL ise 1" value="${draft.exchangeRate || 1}" autocomplete="off" />
        </label>
      </div>

      <div>
        <label class="field-label" for="headingName">Başlık</label>
        <input class="text-input" id="headingName" name="headingName" placeholder="Örn. Kira, HGS, Altın" autocomplete="off" />
      </div>

      <div>
        <label class="field-label" for="shortName">Kısa isim / lakap</label>
        <input class="text-input" id="shortName" name="shortName" placeholder="Örn. haraç, yol yedi, ayın tokadı" autocomplete="off" />
      </div>

      <div>
        <span class="field-label">Öneriler</span>
        <div class="chips">
          ${headingSuggestions.map((item) => `<button class="chip" data-suggestion="${item.name}" data-short="${item.shortName}" data-emoji="${item.emoji}" type="button">${item.emoji} ${item.name}</button>`).join("")}
        </div>
      </div>

      <div>
        <span class="field-label">Emoji</span>
        <div class="chips">
          ${["💸", "💰", "🤝", "⏰", "🛒", "🏠", "⛽", "🚗", "💡", "🪙", "🍼", "🏖️", "💼", "🧾"]
            .map((emoji) => `<button class="emoji-chip ${draft.emoji === emoji ? "selected" : ""}" data-chip="emoji" data-value="${emoji}" type="button">${emoji}</button>`)
            .join("")}
        </div>
      </div>

      <label>
        <span class="field-label">${memberLabel}</span>
        <select class="select-input" name="userId">
          ${members.map((user) => `<option value="${user.id}" ${draft.userId === user.id ? "selected" : ""}>${user.name}</option>`).join("")}
        </select>
      </label>

      <div class="grid-2">
        <label>
          <span class="field-label">${dateLabel}</span>
          <input class="select-input" name="date" type="date" value="${draft.date || todayKey()}" />
        </label>
        <label>
          <span class="field-label">Hesaplaşma</span>
          <select class="select-input" name="settlement">
            <option value="in" ${draft.settlement === "in" ? "selected" : ""}>Dahil</option>
            <option value="out" ${draft.settlement === "out" ? "selected" : ""}>Dahil değil</option>
          </select>
        </label>
      </div>

      <label>
        <span class="field-label">Not</span>
        <input class="text-input" name="note" placeholder="Örn. bugün şuradan 1200 TL aldım" autocomplete="off" />
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

function renderReport() {
  const period = state.reportPeriod;
  const entries = actualEntries().filter((entry) => isInPeriod(entry.date, period));
  const totals = calculateTotals(entries);
  const label = period === "day" ? "Bugün" : period === "week" ? "Bu hafta" : "Bu ay";

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
          <p>Giren ${money(totals.income)}, çıkan ${money(totals.expense)}.</p>
        </div>
        <span class="quick-pill">${entries.length} kayıt</span>
      </div>
      <div class="bars" style="margin-top: 16px;">
        ${headingBars(entries)}
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
    </section>

    <section class="card">
      <h2>Projeye kişi ekle</h2>
      <p>${
        canManageUsers
          ? `Önce diğer profili oluştur. Sonra adını buraya yazıp ${project.name} kasasına ekle.`
          : `Şu an ${shortName(user?.name || "bu kullanıcı")} hesabındasın. Kullanıcı eklemek için ${shortName(owner?.name || "kasa sahibi")} hesabıyla giriş yap.`
      }</p>
      ${
        canManageUsers
          ? `
            <form class="inline-form featured-form" id="projectUserForm">
              <input class="text-input" name="userName" placeholder="Örn. Havva veya Derya" autocomplete="off" />
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
          <p>Bu denemede katılımı manuel profil ekleyerek yapıyoruz. Kod/link modeli gerçek çoklu telefon sürümüne kalacak.</p>
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
          ? `Kasa sahibi ${shortName(owner?.name || "kurucu")}. Kullanıcı adını yazıp bu kasaya ekleyebilir.`
          : `Bu kasayı ${shortName(owner?.name || "kasa sahibi")} yönetir. Kullanıcı ekleme sadece onda.`
      }</p>
      <div class="expense-list" style="margin-top:12px;">
        ${state.users.map(userLinkRow).join("")}
      </div>
      ${
        canManageUsers
          ? `
            <form class="inline-form" id="userForm">
              <input class="text-input" name="userName" placeholder="Kullanıcı adı: Havva" autocomplete="off" />
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
                  ? transactions.map((tx) => `<div class="split-row"><strong>${shortName(tx.from)} → ${shortName(tx.to)}</strong><span>${money(tx.amount)}</span></div>`).join("")
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
          <input class="text-input" name="headingName" placeholder="Örn. Altın" autocomplete="off" />
        </label>
        <label>
          <span class="field-label">Kısa isim / lakap</span>
          <input class="text-input" name="shortName" placeholder="Örn. haraç" autocomplete="off" />
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
