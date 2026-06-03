function formFile(data, name) {
  const file = data.get(name);
  return file && typeof file === "object" && file.size ? file : null;
}

function readImageAsDataUrl(file) {
  if (!file || typeof FileReader === "undefined") return Promise.resolve("");
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result || "");
      if (!source.startsWith("data:image/")) return resolve(source);
      if (file.type === "image/gif") return resolve(source);

      const image = new Image();
      image.onload = () => {
        const maxSide = 900;
        const scale = Math.min(1, maxSide / Math.max(image.width || maxSide, image.height || maxSide));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round((image.width || maxSide) * scale));
        canvas.height = Math.max(1, Math.round((image.height || maxSide) * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.onerror = () => resolve(source);
      image.src = source;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

async function mediaFromForm(data, fields) {
  const file = formFile(data, fields.photo);
  return {
    emoji: String(data.get(fields.emoji) || "").trim(),
    gif: String(data.get(fields.gif) || "").trim(),
    photoName: file?.name || "",
    photoData: await readImageAsDataUrl(file),
  };
}

function bindScreen() {
  app.querySelectorAll("[data-action='go-back']").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = "home";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='open-group']").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = "group";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='open-notifications']").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = "notifications";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='open-movements']").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = "movements";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='go-add'], [data-action='go-add-expense']").forEach((button) => {
    button.addEventListener("click", () => {
      draft.type = "expense";
      draft.emoji = "💸";
      draft.userId = currentUser()?.id || activeMembers()[0]?.id || state.users[0]?.id;
      draft.date = todayKey();
      draft.amountInput = "";
      state.activeView = "add";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='go-add-income']").forEach((button) => {
    button.addEventListener("click", () => {
      draft.type = "income";
      draft.emoji = "💰";
      draft.userId = currentUser()?.id || activeMembers()[0]?.id || state.users[0]?.id;
      draft.date = todayKey();
      draft.amountInput = "";
      state.activeView = "add";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='go-add-payable']").forEach((button) => {
    button.addEventListener("click", () => {
      draft.type = "payable";
      draft.emoji = "⏰";
      draft.userId = currentUser()?.id || activeMembers()[0]?.id || state.users[0]?.id;
      draft.date = todayKey();
      draft.amountInput = "";
      state.activeView = "add";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='open-headings']").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = "headings";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='toggle-settlement']").forEach((button) => {
    button.addEventListener("click", () => {
      state.settlementVisible = !state.settlementVisible;
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='show-pending-detail']").forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingDetail = button.dataset.detail;
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='hide-pending-detail']").forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingDetail = "";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='activate-project']").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeProjectId = button.dataset.id;
      draft = makeDraft();
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='toggle-user-project']").forEach((button) => {
    button.addEventListener("click", () => {
      toggleUserInProject(button.dataset.id);
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='copy-project-link']").forEach((button) => {
    button.addEventListener("click", () => copyProjectInvite());
  });

  app.querySelectorAll("[data-action='auth-mode']").forEach((button) => {
    button.addEventListener("click", () => {
      state.authMode = button.dataset.mode === "signup" ? "signup" : "login";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='logout']").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        if (typeof isCloudReady === "function" && isCloudReady()) await cloudSignOut();
      } catch (error) {
        toast(friendlyCloudError(error));
      }
      state.signedInUserId = "";
      state.activeUserId = "";
      state.activeView = "home";
      state.authMode = "login";
      draft = makeDraft();
      saveState();
      render();
      toast("Çıkış yapıldı.");
    });
  });

  app.querySelectorAll("[data-action='share-receipt']").forEach((button) => {
    button.addEventListener("click", shareReceipt);
  });

  app.querySelectorAll("[data-action='guess-notification']").forEach((button) => {
    button.addEventListener("click", () => {
      const result = guessNotification(button.dataset.id, button.dataset.guess);
      if (result.status === "already") return toast("Bu sürprizi zaten tahmin ettin.");
      saveState();
      render();
      toast(result.guess?.correct ? "Doğru tahmin." : "Yanlış tahmin.");
    });
  });

  app.querySelectorAll("[data-action='settle-pending']").forEach((button) => {
    button.addEventListener("click", () => settlePending(button.dataset.id));
  });

  app.querySelectorAll("[data-period]").forEach((button) => {
    button.addEventListener("click", () => {
      state.reportPeriod = button.dataset.period;
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-movement-period]").forEach((button) => {
    button.addEventListener("click", () => {
      state.movementPeriod = button.dataset.movementPeriod;
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-entry-type]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = app.querySelector("#entryForm");
      if (form) {
        draft.amountInput = formatAmountInput(form.elements.amount?.value);
        draft.currency = String(form.elements.currency?.value || draft.currency || "TRY");
        draft.exchangeRate = parseAmount(form.elements.exchangeRate?.value || draft.exchangeRate || 1);
        draft.userId = currentUser()?.id || String(form.elements.userId?.value || draft.userId || "");
        draft.date = String(form.elements.date?.value || draft.date || todayKey());
        draft.settlement = String(form.elements.settlement?.value || draft.settlement || "in");
        draft.notificationMode = String(form.elements.notificationMode?.value || draft.notificationMode || "open");
        draft.notificationEmoji = String(form.elements.notificationEmoji?.value || draft.notificationEmoji || "🎲");
        draft.notificationGif = String(form.elements.notificationGif?.value || draft.notificationGif || "");
        draft.successReaction = String(form.elements.successReaction?.value || draft.successReaction || "✅");
        draft.successGif = String(form.elements.successGif?.value || draft.successGif || "");
        draft.failReaction = String(form.elements.failReaction?.value || draft.failReaction || "🙃");
        draft.failGif = String(form.elements.failGif?.value || draft.failGif || "");
      }
      draft.type = button.dataset.entryType;
      draft.emoji = emojiOptionsFor(draft.type)[0] || entryTypes.find((type) => type.id === draft.type)?.emoji || draft.emoji;
      render();
    });
  });

  app.querySelectorAll("[data-chip='emoji']").forEach((button) => {
    button.addEventListener("click", () => {
      draft.emoji = button.dataset.value;
      button.closest(".chips")?.querySelectorAll(".emoji-chip").forEach((chip) => chip.classList.toggle("selected", chip === button));
    });
  });

  app.querySelectorAll("[data-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = app.querySelector("#entryForm");
      if (!form) return;
      form.elements.headingName.value = button.dataset.suggestion;
      form.elements.shortName.value = button.dataset.short;
    });
  });

  const projectSelect = app.querySelector("#projectSelect");
  if (projectSelect) {
    projectSelect.addEventListener("change", () => {
      state.activeProjectId = projectSelect.value;
      draft = makeDraft();
      saveState();
      render();
    });
  }

  const accountForm = app.querySelector("#accountForm");
  if (accountForm) {
    accountForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(accountForm);
      const name = String(data.get("userName") || "").trim();
      const email = String(data.get("email") || "").trim().toLowerCase();
      const password = normalizePassword(data.get("password"));
      if (!name) return toast("Ad soyad yazalım.");
      if (typeof isCloudReady === "function" && isCloudReady()) {
        if (!email || !email.includes("@")) return toast("Geçerli bir e-posta yazalım.");
        if (password.length < 6) return toast("Bulut hesabı için şifre en az 6 karakter olsun.");
        try {
          const result = await cloudSignUp({
            name,
            email,
            password,
            nickname: String(data.get("nickname") || "").trim(),
          });
          render();
          return toast(result.session ? "Hesap açıldı ve giriş yapıldı." : "Hesap açıldı. E-postadaki doğrulama linkini kontrol et.");
        } catch (error) {
          return toast(friendlyCloudError(error));
        }
      }
      if (password.length < 4) return toast("Şifre en az 4 karakter olsun.");
      const user = createUser(name, password, {
        email,
        nickname: String(data.get("nickname") || "").trim(),
        linkToProject: false,
      });
      state.signedInUserId = "";
      state.activeUserId = "";
      state.pendingLoginUserId = user.id;
      state.authMode = "login";
      saveState();
      render();
      toast("Hesap oluşturuldu. Şimdi giriş yap.");
    });
  }

  const firstProjectForm = app.querySelector("#firstProjectForm");
  if (firstProjectForm) {
    firstProjectForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(firstProjectForm);
      const name = String(data.get("projectName") || "").trim();
      if (!name) return toast("Kasa adını yazalım.");
      createProject(name, String(data.get("purpose") || "").trim() || "Genel kasa");
      try {
        saveState();
        if (typeof isCloudReady === "function" && isCloudReady()) await cloudPushState();
        render();
        toast("Kasa oluşturuldu.");
      } catch (error) {
        toast(friendlyCloudError(error));
      }
    });
  }

  const loginForm = app.querySelector("#loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(loginForm);
      if (typeof isCloudReady === "function" && isCloudReady()) {
        const email = String(data.get("loginEmail") || "").trim().toLowerCase();
        const password = normalizePassword(data.get("loginPassword"));
        if (!email || !email.includes("@")) return toast("E-postanı yazalım.");
        if (!password) return toast("Şifreni yazalım.");
        try {
          await cloudSignIn({ email, password });
          render();
          return toast("Giriş yapıldı.");
        } catch (error) {
          return toast(friendlyCloudError(error));
        }
      }
      const user = state.users.find((item) => item.id === String(data.get("loginUserId")));
      if (!state.users.length) return toast("Önce kullanıcı oluştur.");
      if (!user) return toast("Kullanıcı bulunamadı.");
      const password = normalizePassword(data.get("loginPassword"));
      if (user.password && normalizePassword(user.password) !== password) return toast("Şifre yanlış.");
      if (!user.password && password) return toast("Bu profil şifresiz.");
      if (!user.password && !password) return toast("Bu profil için şifre yok. Deneme profillerini hareket içinde seçebilirsin.");
      state.signedInUserId = user.id;
      state.activeUserId = user.id;
      state.pendingLoginUserId = "";
      draft = makeDraft();
      saveState();
      render();
      toast(`${profileLabel(user)} giriş yaptı.`);
    });
  }

  const quickUserForm = app.querySelector("#quickUserForm");
  if (quickUserForm) {
    quickUserForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(quickUserForm);
      const name = String(data.get("userName") || "").trim();
      if (!name) return toast("Kullanıcı adını yazalım.");
      createUser(name, String(data.get("password") || ""), { nickname: String(data.get("nickname") || "").trim(), makeActive: false });
      saveState();
      render();
      toast("Kullanıcı oluşturuldu ve projeye bağlandı.");
    });
  }

  const joinProjectForm = app.querySelector("#joinProjectForm");
  if (joinProjectForm) {
    joinProjectForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const code = normalizeCode(new FormData(joinProjectForm).get("projectCode"));
      if (!code) return toast("Proje kodunu yazalım.");
      if (typeof isCloudReady === "function" && isCloudReady()) {
        try {
          await cloudJoinProjectByCode(code);
          render();
          return toast("Kasaya katıldın.");
        } catch (error) {
          return toast(friendlyCloudError(error));
        }
      }
      const project = state.projects.find((item) => normalizeCode(projectCode(item)) === code);
      if (!project) return toast("Bu kod bu cihazda yok. Gerçekte bulut veritabanından açılacak.");
      const userId = state.activeUserId || state.users[0]?.id;
      if (userId && !project.memberIds.includes(userId)) project.memberIds.push(userId);
      state.activeProjectId = project.id;
      draft = makeDraft();
      saveState();
      render();
      toast("Projeye katıldın.");
    });
  }

  const entryForm = app.querySelector("#entryForm");
  if (entryForm) {
    const amountInput = entryForm.querySelector("#amount");
    if (amountInput) {
      amountInput.addEventListener("input", () => {
        amountInput.value = formatAmountInput(amountInput.value);
        draft.amountInput = amountInput.value;
      });
    }

    const currencySelect = entryForm.querySelector("select[name='currency']");
    const rateField = entryForm.querySelector(".fx-rate-field");
    const currencyGrid = entryForm.querySelector(".currency-grid");
    const rateInput = entryForm.querySelector("input[name='exchangeRate']");
    if (currencySelect && rateField) {
      currencySelect.addEventListener("change", () => {
        const isTry = currencySelect.value === "TRY";
        rateField.classList.toggle("is-hidden", isTry);
        currencyGrid?.classList.toggle("single", isTry);
        draft.currency = currencySelect.value;
        if (isTry && rateInput) {
          rateInput.value = "1";
          draft.exchangeRate = 1;
        }
      });
    }

    entryForm.querySelectorAll("select[name='notificationMode'], input[name='notificationEmoji'], input[name='notificationGif'], input[name='successReaction'], input[name='successGif'], input[name='failReaction'], input[name='failGif']").forEach((field) => {
      field.addEventListener("change", () => {
        draft.notificationMode = entryForm.elements.notificationMode?.value || draft.notificationMode;
        draft.notificationEmoji = entryForm.elements.notificationEmoji?.value || draft.notificationEmoji;
        draft.notificationGif = entryForm.elements.notificationGif?.value || draft.notificationGif;
        draft.successReaction = entryForm.elements.successReaction?.value || draft.successReaction;
        draft.successGif = entryForm.elements.successGif?.value || draft.successGif;
        draft.failReaction = entryForm.elements.failReaction?.value || draft.failReaction;
        draft.failGif = entryForm.elements.failGif?.value || draft.failGif;
      });
    });

    entryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(entryForm);
      const enteredAmount = parseAmount(data.get("amount"));
      const currency = String(data.get("currency") || "TRY").toUpperCase();
      const exchangeRate = currency === "TRY" ? 1 : parseAmount(data.get("exchangeRate"));
      const amount = enteredAmount * exchangeRate;
      const headingName = String(data.get("headingName") || "").trim();

      if (!enteredAmount || enteredAmount <= 0) return toast("Önce tutarı yazalım.");
      if (!currencyOptions.some((item) => item.code === currency)) return toast("Para birimini seçelim.");
      if (!exchangeRate || exchangeRate <= 0) return toast("Döviz için kuru yazalım.");
      if (!headingName) return toast("Bir başlık yazalım.");
      if (!activeMembers().length) return toast("Önce projeye kullanıcı bağlayalım.");

      const short = String(data.get("shortName") || "").trim() || headingName;
      const heading = ensureHeading(headingName, short, draft.emoji);
      const userId = currentUser()?.id || String(data.get("userId"));
      const date = String(data.get("date") || todayKey());
      const settlement = String(data.get("settlement")) === "in";

      if (userId && activeProject() && !activeProject().memberIds.includes(userId)) activeProject().memberIds.push(userId);
      draft.userId = userId;
      draft.settlement = settlement ? "in" : "out";
      draft.date = date;
      draft.currency = currency;
      draft.exchangeRate = exchangeRate;
      draft.amountInput = formatAmountInput(data.get("amount"));
      draft.notificationMode = String(data.get("notificationMode") || draft.notificationMode || "silent");
      draft.notificationEmoji = String(data.get("notificationEmoji") || draft.notificationEmoji || "🎲").trim();
      draft.notificationGif = String(data.get("notificationGif") || "").trim();
      draft.successReaction = String(data.get("successReaction") || draft.successReaction || "✅").trim();
      draft.successGif = String(data.get("successGif") || "").trim();
      draft.failReaction = String(data.get("failReaction") || draft.failReaction || "🙃").trim();
      draft.failGif = String(data.get("failGif") || "").trim();

      const entryPhoto = formFile(data, "photo");
      const notificationMedia = await mediaFromForm(data, { emoji: "notificationEmoji", gif: "notificationGif", photo: "notificationPhoto" });
      const successMedia = await mediaFromForm(data, { emoji: "successReaction", gif: "successGif", photo: "successPhoto" });
      const failMedia = await mediaFromForm(data, { emoji: "failReaction", gif: "failGif", photo: "failPhoto" });

      const entry = {
        id: makeId(),
        projectId: state.activeProjectId,
        type: draft.type,
        amount,
        enteredAmount,
        currency,
        exchangeRate,
        headingId: heading.id,
        headingName: heading.name,
        shortName: heading.shortName,
        emoji: heading.emoji,
        userId,
        date,
        note: String(data.get("note") || "").trim(),
        photoName: entryPhoto?.name || "",
        photoData: await readImageAsDataUrl(entryPhoto),
        settlement,
        status: ["receivable", "payable"].includes(draft.type) ? "pending" : "done",
        createdAt: new Date().toISOString(),
      };

      state.entries.unshift(entry);
      const notification = createEntryNotification(entry, {
        mode: draft.notificationMode,
        emoji: notificationMedia.emoji || "🎲",
        gif: notificationMedia.gif,
        photoName: notificationMedia.photoName,
        photoData: notificationMedia.photoData,
        successReaction: successMedia.emoji || "✅",
        successGif: successMedia.gif,
        successPhotoName: successMedia.photoName,
        successPhotoData: successMedia.photoData,
        failReaction: failMedia.emoji || "🙃",
        failGif: failMedia.gif,
        failPhotoName: failMedia.photoName,
        failPhotoData: failMedia.photoData,
      });
      if (notification?.mode === "surprise") entry.lockedNotificationId = notification.id;

      saveState();
      state.activeView = "home";
      draft.amountInput = "";
      draft.date = todayKey();
      render();
      toast("Hareket kasaya girdi.");
    });
  }

  const headingForm = app.querySelector("#headingForm");
  if (headingForm) {
    headingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(headingForm);
      const name = String(data.get("headingName") || "").trim();
      if (!name) return toast("Başlık adını yazalım.");
      ensureHeading(name, String(data.get("shortName") || "").trim() || name, draft.emoji);
      saveState();
      render();
      toast("Başlık eklendi.");
    });
  }

  app.querySelectorAll("#userForm, #projectUserForm").forEach((userForm) => {
    userForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(userForm);
      const name = String(data.get("userName") || "").trim();
      if (!name) return toast((typeof isCloudReady === "function" && isCloudReady()) ? "Kasaya eklenecek e-postayı yazalım." : "Kasaya eklenecek kullanıcı adını yazalım.");
      if (typeof isCloudReady === "function" && isCloudReady()) {
        try {
          await cloudAddMemberByEmail(name);
          render();
          return toast("Kullanıcı kasaya eklendi.");
        } catch (error) {
          return toast(friendlyCloudError(error));
        }
      }
      const result = addUserToActiveProjectByName(name);
      if (result.status === "forbidden") return toast("Kullanıcı eklemeyi sadece kasa sahibi yapar.");
      if (result.status === "missing-user") return toast("Bu adda kullanıcı yok. Önce profilini oluştur.");
      if (result.status === "already") return toast(`${shortName(result.user.name)} zaten bu kasada.`);
      saveState();
      render();
      toast(`${shortName(result.user.name)} kasaya eklendi.`);
    });
  });

  app.querySelectorAll("[data-alias-form]").forEach((aliasForm) => {
    aliasForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = setProjectMemberAlias(aliasForm.dataset.id, new FormData(aliasForm).get("alias"));
      if (result.status === "forbidden") return toast("Lakap vermeyi sadece kasa sahibi yapar.");
      if (result.status === "missing-user") return toast("Bu kullanıcı bu kasada yok.");
      saveState();
      render();
      toast("Kasa içi lakap kaydedildi.");
    });
  });

  const projectForm = app.querySelector("#projectForm");
  if (projectForm) {
    projectForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(projectForm);
      const name = String(data.get("projectName") || "").trim();
      if (!name) return toast("Proje adını yazalım.");
      createProject(name, String(data.get("purpose") || "").trim() || "Genel kasa");
      try {
        saveState();
        if (typeof isCloudReady === "function" && isCloudReady()) await cloudPushState();
        render();
        toast("Proje eklendi.");
      } catch (error) {
        toast(friendlyCloudError(error));
      }
    });
  }
}
