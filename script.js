/* =========================================================
   MADE OF HONOUR
   Main JavaScript
   Vanilla JS
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const CONFIG = {
  couple: {
    first: "Takudzwa",
    second: "Akhona",
    full: "Takudzwa & Akhona",
    date: "25 October 2026",
    location: "170 Bree Street, Cape Town, South Africa"
  },

  images: {
    foodMenu: "food-menu.jpg",
    cocktailMenu: "cocktail-menu.jpg",
    programme: "programme.jpg"
  },

  music: {
    file: "Blueberry Skies.mp3",
    timeKey: "moh_music_time",
    mutedKey: "moh_music_muted"
  },

  guestAccessCode: "HONOUR",

  /*
    ========================================================
    FIREBASE CONFIGURATION

    IMPORTANT:
    Replace these six values with the Firebase Web App
    configuration from your Firebase project.

    Firebase Console:
    Project settings
    → Your apps
    → Web app
    → SDK setup and configuration
    ========================================================
  */

  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID"
  },

  storageKeys: {
    guest: "moh_guest_name",
    notes: "moh_guest_notes",
    photos: "moh_album_photos",
    cookie: "moh_cookie_choice"
  }
};


/* =========================================================
   BASIC HELPERS
   ========================================================= */

const $ = (selector, scope = document) => {
  return scope.querySelector(selector);
};


const $$ = (selector, scope = document) => {
  return [...scope.querySelectorAll(selector)];
};


function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[character];
  });
}


/* =========================================================
   FAVICON
   ========================================================= */

function ensureFavicon() {

  const faviconPath = "Two.png";


  let favicon =
    document.querySelector(
      'link[rel="icon"]'
    );


  if (!favicon) {

    favicon =
      document.createElement("link");

    favicon.rel = "icon";

    document.head.appendChild(
      favicon
    );
  }


  favicon.type =
    "image/png";

  favicon.href =
    faviconPath;


  let shortcutIcon =
    document.querySelector(
      'link[rel="shortcut icon"]'
    );


  if (!shortcutIcon) {

    shortcutIcon =
      document.createElement("link");

    shortcutIcon.rel =
      "shortcut icon";

    document.head.appendChild(
      shortcutIcon
    );
  }


  shortcutIcon.type =
    "image/png";

  shortcutIcon.href =
    faviconPath;
}


/* =========================================================
   WEDDING MUSIC
   ========================================================= */

let weddingAudio = null;


function getMusicMuted() {

  return (
    localStorage.getItem(
      CONFIG.music.mutedKey
    ) === "true"
  );

}


function saveMusicPosition() {

  if (!weddingAudio) return;

  if (
    !Number.isFinite(
      weddingAudio.currentTime
    )
  ) {
    return;
  }


  try {

    localStorage.setItem(
      CONFIG.music.timeKey,
      String(
        weddingAudio.currentTime
      )
    );

  } catch (error) {

    console.warn(
      "Could not save music position.",
      error
    );

  }

}


function restoreMusicPosition() {

  if (!weddingAudio) return;


  const savedTime =
    parseFloat(
      localStorage.getItem(
        CONFIG.music.timeKey
      ) || "0"
    );


  if (
    !Number.isFinite(savedTime) ||
    savedTime < 0
  ) {
    return;
  }


  const restore = () => {

    try {

      if (
        Number.isFinite(
          weddingAudio.duration
        ) &&
        savedTime <
          weddingAudio.duration
      ) {

        weddingAudio.currentTime =
          savedTime;

      }

    } catch (error) {

      console.warn(
        "Could not restore music position.",
        error
      );

    }

  };


  if (
    weddingAudio.readyState >= 1
  ) {

    restore();

  } else {

    weddingAudio.addEventListener(
      "loadedmetadata",
      restore,
      {
        once: true
      }
    );

  }

}


function updateMusicControl() {

  const control =
    $("#wedding-music");

  if (
    !control ||
    !weddingAudio
  ) {
    return;
  }


  const muted =
    weddingAudio.muted;

  const playing =
    !weddingAudio.paused &&
    !muted;


  control.classList.toggle(
    "is-muted",
    muted
  );


  control.classList.toggle(
    "is-playing",
    playing
  );


  const state =
    $(".music-state", control);

  const note =
    $(".music-note", control);

  const button =
    $("#music-toggle");


  if (state) {

    state.textContent =
      muted
        ? "Muted"
        : playing
          ? "On"
          : "Play";

  }


  if (note) {

    note.textContent =
      muted
        ? "×"
        : "♪";

  }


  if (button) {

    button.setAttribute(
      "aria-label",
      muted
        ? "Play wedding music"
        : "Mute wedding music"
    );


    button.setAttribute(
      "title",
      muted
        ? "Play wedding music"
        : "Mute wedding music"
    );

  }

}


async function attemptWeddingMusic() {

  if (!weddingAudio) {
    return false;
  }


  if (weddingAudio.muted) {

    updateMusicControl();

    return false;

  }


  try {

    await weddingAudio.play();

    updateMusicControl();

    return true;

  } catch (error) {

    updateMusicControl();

    return false;

  }

}


function buildMusicControl() {

  if (
    $("#wedding-music")
  ) {
    return;
  }


  const wrapper =
    document.createElement("aside");


  wrapper.id =
    "wedding-music";

  wrapper.className =
    "wedding-music";

  wrapper.setAttribute(
    "aria-label",
    "Wedding music control"
  );


  wrapper.innerHTML = `
    <audio
      id="wedding-audio"
      preload="auto"
      loop
    >
      <source
        src="${escapeHTML(CONFIG.music.file)}"
        type="audio/mpeg"
      >
    </audio>

    <button
      id="music-toggle"
      type="button"
      aria-label="Mute wedding music"
      title="Mute wedding music"
    >
      <span
        class="music-dot"
        aria-hidden="true"
      ></span>

      <span class="music-state">
        On
      </span>

      <span
        class="music-note"
        aria-hidden="true"
      >♪</span>
    </button>
  `;


  document.body.appendChild(
    wrapper
  );


  weddingAudio =
    $("#wedding-audio");


  if (!weddingAudio) {
    return;
  }


  weddingAudio.muted =
    getMusicMuted();


  restoreMusicPosition();


  weddingAudio.addEventListener(
    "play",
    updateMusicControl
  );


  weddingAudio.addEventListener(
    "pause",
    updateMusicControl
  );


  weddingAudio.addEventListener(
    "volumechange",
    updateMusicControl
  );


  weddingAudio.addEventListener(
    "ended",
    updateMusicControl
  );


  let lastSavedSecond = -1;


  weddingAudio.addEventListener(
    "timeupdate",
    () => {

      const currentSecond =
        Math.floor(
          weddingAudio.currentTime
        );


      if (
        currentSecond % 2 === 0 &&
        currentSecond !==
          lastSavedSecond
      ) {

        lastSavedSecond =
          currentSecond;

        saveMusicPosition();

      }

    }
  );


  const musicToggle =
    $("#music-toggle");


  if (musicToggle) {

    musicToggle.addEventListener(
      "click",
      async event => {

        event.preventDefault();

        event.stopPropagation();


        if (
          weddingAudio.muted
        ) {

          weddingAudio.muted =
            false;


          localStorage.setItem(
            CONFIG.music.mutedKey,
            "false"
          );


          await attemptWeddingMusic();

        } else {

          saveMusicPosition();


          weddingAudio.muted =
            true;


          localStorage.setItem(
            CONFIG.music.mutedKey,
            "true"
          );


          updateMusicControl();

        }

      }
    );

  }


  window.addEventListener(
    "pagehide",
    saveMusicPosition
  );


  window.addEventListener(
    "beforeunload",
    saveMusicPosition
  );


  updateMusicControl();


  attemptWeddingMusic();
}


/* =========================================================
   START MUSIC AFTER USER INTERACTION
   ========================================================= */

function enableMusicAfterInteraction() {

  if (!weddingAudio) return;

  if (weddingAudio.muted) return;

  if (!weddingAudio.paused) return;

  attemptWeddingMusic();

}


/* =========================================================
   COUPLE / GUEST DETAILS
   ========================================================= */

function setCoupleDetails() {

  $$("[data-couple]").forEach(
    element => {

      element.textContent =
        CONFIG.couple.full;

    }
  );


  $$("[data-couple-first]").forEach(
    element => {

      element.textContent =
        CONFIG.couple.first;

    }
  );


  $$("[data-couple-second]").forEach(
    element => {

      element.textContent =
        CONFIG.couple.second;

    }
  );


  $$("[data-date]").forEach(
    element => {

      element.textContent =
        CONFIG.couple.date;

    }
  );


  $$("[data-location]").forEach(
    element => {

      element.textContent =
        CONFIG.couple.location;

    }
  );


  const guest =
    localStorage.getItem(
      CONFIG.storageKeys.guest
    ) || "guest";


  $$("[data-guest]").forEach(
    element => {

      element.textContent =
        guest;

    }
  );

}


/* =========================================================
   HEADER / NAVIGATION
   ========================================================= */

function buildHeader() {

  const mount =
    $("#site-header");


  if (!mount) return;


  const currentPage =
    document.body.dataset.page ||
    "";


  const links = [
    ["home.html", "Home", "home"],
    ["menu.html", "Menu", "menu"],
    ["cocktails.html", "Cocktails", "cocktails"],
    ["programme.html", "Programme", "programme"],
    ["notes.html", "Guestbook", "notes"],
    ["camera.html", "Camera", "camera"],
    ["album.html", "Album", "album"]
  ];


  mount.innerHTML = `
    <header class="site-header">

      <a
        class="site-wordmark"
        href="home.html"
      >
        Made of Honour
      </a>

      <button
        class="menu-toggle"
        id="menu-toggle"
        type="button"
        aria-label="Open navigation"
        aria-expanded="false"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav
        class="site-nav"
        id="site-nav"
        aria-label="Wedding navigation"
      >
        ${links.map(
          ([href, label, key]) => `
            <a
              href="${href}"
              class="${
                currentPage === key
                  ? "active"
                  : ""
              }"
            >
              ${label}
            </a>
          `
        ).join("")}
      </nav>

    </header>
  `;


  const toggle =
    $("#menu-toggle");

  const nav =
    $("#site-nav");


  if (
    toggle &&
    nav
  ) {

    toggle.addEventListener(
      "click",
      event => {

        event.stopPropagation();


        const isOpen =
          nav.classList.toggle(
            "open"
          );


        toggle.setAttribute(
          "aria-expanded",
          String(isOpen)
        );


        toggle.setAttribute(
          "aria-label",
          isOpen
            ? "Close navigation"
            : "Open navigation"
        );


        enableMusicAfterInteraction();

      }
    );


    $$(".site-nav a").forEach(
      link => {

        link.addEventListener(
          "click",
          () => {

            nav.classList.remove(
              "open"
            );


            toggle.setAttribute(
              "aria-expanded",
              "false"
            );


            toggle.setAttribute(
              "aria-label",
              "Open navigation"
            );

          }
        );

      }
    );

  }

}


/* =========================================================
   FOOTER
   ========================================================= */

function buildFooter() {

  const mount =
    $("#site-footer");


  if (!mount) return;


  mount.innerHTML = `
    <footer class="site-footer">

      <div class="footer-inner">

        <div>

          <div class="footer-wordmark">
            Made of <em>Honour.</em>
          </div>

          <p
            class="fine-print"
            style="color:#9ab0b3;margin:.6rem 0 0"
          >
            A digital guest experience for and by our beautiful couple,
            ${escapeHTML(CONFIG.couple.full)}.
          </p>

        </div>

        <nav
          class="footer-links"
          aria-label="Footer navigation"
        >
          <a href="home.html">Home</a>
          <a href="menu.html">Menu</a>
          <a href="programme.html">Programme</a>
          <a href="notes.html">Guestbook</a>
          <a href="camera.html">Camera</a>
          <a href="album.html">Album</a>
        </nav>

      </div>

      <div class="footer-bottom">

        <span>
          ${escapeHTML(CONFIG.couple.location)}
        </span>

        <span>
          Made by Takudzwa Chakahwata as part of my portfolio.
        </span>

      </div>

    </footer>
  `;

}


/* =========================================================
   PAGE TRANSITIONS
   ========================================================= */

function pageTransitions() {

  document.addEventListener(
    "click",
    event => {

      const link =
        event.target.closest(
          "a[href]"
        );


      if (!link) return;


      const href =
        link.getAttribute(
          "href"
        );


      if (!href) return;


      if (
        href.startsWith("#")
      ) {
        return;
      }


      if (
        href.startsWith(
          "http://"
        ) ||
        href.startsWith(
          "https://"
        ) ||
        href.startsWith(
          "mailto:"
        )
      ) {
        return;
      }


      if (
        link.target ===
        "_blank"
      ) {
        return;
      }


      if (
        link.hasAttribute(
          "download"
        )
      ) {
        return;
      }


      event.preventDefault();


      enableMusicAfterInteraction();

      saveMusicPosition();


      document.body.classList.add(
        "is-leaving"
      );


      window.setTimeout(
        () => {

          window.location.href =
            href;

        },
        230
      );

    }
  );


  document.addEventListener(
    "pointerdown",
    event => {

      if (
        event.target.closest(
          "#music-toggle"
        )
      ) {
        return;
      }


      enableMusicAfterInteraction();

    },
    {
      passive: true
    }
  );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Tab" ||
        event.key === "Enter" ||
        event.key === " "
      ) {

        enableMusicAfterInteraction();

      }

    }
  );

}


/* =========================================================
   SCROLL REVEALS
   ========================================================= */

function revealOnScroll() {

  const items =
    $$(".reveal");


  if (!items.length) return;


  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    items.forEach(
      element => {

        element.classList.add(
          "in-view"
        );

      }
    );

    return;
  }


  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(
          entry => {

            if (
              !entry.isIntersecting
            ) {
              return;
            }


            entry.target.classList.add(
              "in-view"
            );


            observer.unobserve(
              entry.target
            );

          }
        );

      },
      {
        threshold: 0.12
      }
    );


  items.forEach(
    element => {

      observer.observe(
        element
      );

    }
  );

}


/* =========================================================
   COOKIE NOTICE
   ========================================================= */

function initCookie() {

  const mount =
    $("#cookie-banner");


  if (!mount) return;


  if (
    localStorage.getItem(
      CONFIG.storageKeys.cookie
    )
  ) {
    return;
  }


  mount.innerHTML = `
    <aside
      class="cookie-banner"
      aria-label="Cookie notice"
    >

      <p>
        Made of Honour uses cookies to help
        create a smoother experience on this device.
      </p>

      <div class="cookie-actions">

        <button
          class="accept"
          id="cookie-accept"
          type="button"
        >
          Accept
        </button>

        <button
          class="cookie-close"
          id="cookie-close"
          type="button"
          aria-label="Dismiss cookie notice"
        >
          ×
        </button>

      </div>

    </aside>
  `;


  const closeBanner =
    choice => {

      localStorage.setItem(
        CONFIG.storageKeys.cookie,
        choice
      );


      mount.innerHTML = "";

    };


  $("#cookie-accept")?.addEventListener(
    "click",
    () => {

      closeBanner(
        "accepted"
      );

    }
  );


  $("#cookie-close")?.addEventListener(
    "click",
    () => {

      closeBanner(
        "dismissed"
      );

    }
  );

}


/* =========================================================
   LOGIN
   ========================================================= */

function initLogin() {

  const form =
    $("#guest-form");


  if (!form) return;


  const nameInput =
    $("#guest-name");

  const codeInput =
    $("#access-code");

  const error =
    $("#login-error");


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const name =
        nameInput?.value.trim() ||
        "";


      const code =
        codeInput?.value
          .trim()
          .toUpperCase() ||
        "";


      if (
        !name ||
        !code
      ) {

        if (error) {

          error.textContent =
            "Please enter your name and the guest access code.";

        }

        return;
      }


      if (
        code !==
        CONFIG.guestAccessCode
      ) {

        if (error) {

          error.textContent =
            "That access code doesn't match the invitation. Try HONOUR for this demo.";

        }

        return;
      }


      if (error) {

        error.textContent =
          "";

      }


      localStorage.setItem(
        CONFIG.storageKeys.guest,
        name
      );


      sessionStorage.setItem(
        "moh_authenticated",
        "true"
      );


      enableMusicAfterInteraction();

      saveMusicPosition();


      document.body.classList.add(
        "is-leaving"
      );


      window.setTimeout(
        () => {

          window.location.href =
            "loading.html";

        },
        260
      );

    }
  );

}


/* =========================================================
   LOADING PAGE
   ========================================================= */

function initLoading() {

  const progress =
    $("#loading-progress");


  if (!progress) return;


  const status =
    $("#loading-status");


  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  const messages = [
    "Setting the table",
    "Putting the music on",
    "Making room for everyone",
    "Almost there"
  ];


  const duration =
    reducedMotion
      ? 400
      : 1800;


  const start =
    performance.now();


  function tick(now) {

    const percentage =
      Math.min(
        100,
        ((now - start) /
          duration) *
          100
      );


    progress.style.width =
      `${percentage}%`;


    if (status) {

      const index =
        Math.min(
          messages.length - 1,
          Math.floor(
            percentage / 26
          )
        );


      status.textContent =
        messages[index];

    }


    if (
      percentage < 100
    ) {

      requestAnimationFrame(
        tick
      );

      return;
    }


    window.setTimeout(
      () => {

        enableMusicAfterInteraction();

        saveMusicPosition();


        document.body.classList.add(
          "is-leaving"
        );


        window.setTimeout(
          () => {

            window.location.href =
              "home.html";

          },
          260
        );

      },
      reducedMotion
        ? 80
        : 350
    );

  }


  requestAnimationFrame(
    tick
  );

}


/* =========================================================
   IMAGE PATHS
   ========================================================= */

function imagePath(filename) {

  const imageMap = {

    "food-menu.jpg":
      CONFIG.images.foodMenu,

    "cocktail-menu.jpg":
      CONFIG.images.cocktailMenu,

    "programme.jpg":
      CONFIG.images.programme

  };


  return (
    imageMap[filename] ||
    filename
  );

}


/* =========================================================
   IMAGE MODAL
   ========================================================= */

function initImageModal() {

  const buttons =
    $$("[data-open-image]");


  if (!buttons.length) return;


  let modal =
    $("#image-modal");


  if (!modal) {

    modal =
      document.createElement(
        "div"
      );


    modal.id =
      "image-modal";


    document.body.appendChild(
      modal
    );

  }


  const closeModal =
    () => {

      modal.innerHTML =
        "";

      document.body.style.overflow =
        "";

    };


  buttons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          enableMusicAfterInteraction();


          const requested =
            button.dataset.openImage;


          const title =
            button.dataset.imageTitle ||
            "Wedding artwork";


          const source =
            imagePath(
              requested
            );


          modal.innerHTML = `
            <div
              class="modal-backdrop"
              role="dialog"
              aria-modal="true"
              aria-label="${escapeHTML(title)}"
            >

              <div class="modal-panel">

                <button
                  class="modal-close"
                  type="button"
                  aria-label="Close image viewer"
                >
                  ×
                </button>

                <img
                  src="${escapeHTML(source)}"
                  alt="${escapeHTML(title)}"
                >

                <div class="modal-title">
                  ${escapeHTML(title)}
                </div>

              </div>

            </div>
          `;


          document.body.style.overflow =
            "hidden";


          const closeButton =
            $(".modal-close", modal);


          closeButton?.addEventListener(
            "click",
            closeModal
          );


          const backdrop =
            $(".modal-backdrop", modal);


          backdrop?.addEventListener(
            "click",
            event => {

              if (
                event.target ===
                backdrop
              ) {

                closeModal();

              }

            }
          );


          const escapeHandler =
            event => {

              if (
                event.key ===
                "Escape"
              ) {

                closeModal();


                document.removeEventListener(
                  "keydown",
                  escapeHandler
                );

              }

            };


          document.addEventListener(
            "keydown",
            escapeHandler
          );

        }
      );

    }
  );

}


/* =========================================================
   GUESTBOOK / NOTES
   ========================================================= */

function getNotes() {

  try {

    const stored =
      localStorage.getItem(
        CONFIG.storageKeys.notes
      );


    const parsed =
      JSON.parse(
        stored || "[]"
      );


    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch (error) {

    return [];

  }

}


function initNotes() {

  const form =
    $("#note-form");

  const list =
    $("#notes-list");


  if (
    !form ||
    !list
  ) {
    return;
  }


  const nameInput =
    $("#note-name");

  const messageInput =
    $("#note-message");

  const characterCount =
    $("#char-count");

  const error =
    $("#note-error");


  nameInput.value =
    localStorage.getItem(
      CONFIG.storageKeys.guest
    ) || "Guest";


  function renderNotes() {

    const notes =
      getNotes();


    const noteCount =
      $("#note-count");


    if (noteCount) {

      noteCount.textContent =
        `${notes.length} ${
          notes.length === 1
            ? "note"
            : "notes"
        }`;

    }


    if (!notes.length) {

      list.innerHTML = `
        <div
          class="album-empty"
          style="grid-column:1/-1;min-height:18rem"
        >

          <div>

            <p class="eyebrow">
              The guestbook is quiet
            </p>

            <h3>
              Nothing here yet.
            </h3>

            <p>
              Be the first person to leave
              the couple something they can
              read after the room has emptied.
            </p>

          </div>

        </div>
      `;


      return;
    }


    list.innerHTML =
      notes.map(
        note => `
          <article class="note-card">

            <p>
              “${escapeHTML(
                note.message
              )}”
            </p>

            <small>
              From
              ${escapeHTML(
                note.name
              )}
              ·
              ${escapeHTML(
                note.date
              )}
            </small>

          </article>
        `
      ).join("");

  }


  messageInput?.addEventListener(
    "input",
    () => {

      if (characterCount) {

        characterCount.textContent =
          `${messageInput.value.length} / 500`;

      }

    }
  );


  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const message =
        messageInput.value.trim();


      if (!message) {

        if (error) {

          error.textContent =
            "Write a little something first.";

        }


        messageInput.focus();


        return;
      }


      const notes =
        getNotes();


      notes.unshift({

        name:
          nameInput.value ||
          "Guest",

        message,

        date:
          new Intl.DateTimeFormat(
            "en-ZA",
            {
              day: "2-digit",
              month: "short",
              year: "numeric"
            }
          ).format(
            new Date()
          )

      });


      localStorage.setItem(
        CONFIG.storageKeys.notes,
        JSON.stringify(
          notes.slice(0, 40)
        )
      );


      messageInput.value =
        "";


      if (characterCount) {

        characterCount.textContent =
          "0 / 500";

      }


      if (error) {

        error.textContent =
          "";

      }


      renderNotes();

    }
  );


  renderNotes();

}


/* =========================================================
   FIREBASE
   ========================================================= */

let firebaseReady = false;

let firebaseUser = null;

let firebaseAuth = null;

let firebaseDatabase = null;

let firebaseStorage = null;

let albumUnsubscribe = null;


/* =========================================================
   FIREBASE CONFIG CHECK
   ========================================================= */

function hasFirebaseConfig() {

  const firebase =
    window.firebase;


  if (!firebase) {
    return false;
  }


  const config =
    CONFIG.firebase;


  if (
    !config ||
    !config.apiKey ||
    !config.projectId ||
    !config.authDomain ||
    !config.storageBucket ||
    !config.messagingSenderId ||
    !config.appId
  ) {
    return false;
  }


  const values =
    Object.values(
      config
    );


  if (
    values.some(
      value =>
        typeof value !==
          "string" ||
        !value.trim() ||
        value.startsWith(
          "YOUR_"
        )
    )
  ) {
    return false;
  }


  return true;

}


/* =========================================================
   FIREBASE INITIALIZATION
   ========================================================= */

async function initFirebase() {

  if (
    firebaseReady &&
    firebaseUser &&
    firebaseAuth &&
    firebaseDatabase &&
    firebaseStorage
  ) {

    return true;

  }


  if (
    !window.firebase
  ) {

    console.error(
      "Firebase SDK is not loaded."
    );

    return false;

  }


  if (
    !hasFirebaseConfig()
  ) {

    console.warn(
      "Firebase configuration has not been added to CONFIG.firebase."
    );

    return false;

  }


  try {

    /*
      Only initialize Firebase once.
    */

    if (
      !window.firebase.apps.length
    ) {

      window.firebase.initializeApp(
        CONFIG.firebase
      );

    }


    firebaseAuth =
      window.firebase.auth();


    firebaseDatabase =
      window.firebase.firestore();


    firebaseStorage =
      window.firebase.storage();


    /*
      Make sure Anonymous Authentication
      actually completes before continuing.
    */

    if (
      !firebaseAuth.currentUser
    ) {

      await firebaseAuth.signInAnonymously();

    }


    /*
      Wait for Firebase Auth's current user
      if necessary.
    */

    if (
      !firebaseAuth.currentUser
    ) {

      firebaseUser =
        await new Promise(
          (resolve, reject) => {

            let unsubscribe =
              null;

            const timeout =
              window.setTimeout(
                () => {

                  if (unsubscribe) {
                    unsubscribe();
                  }

                  reject(
                    new Error(
                      "Firebase authentication timed out."
                    )
                  );

                },
                10000
              );


            unsubscribe =
              firebaseAuth.onAuthStateChanged(
                user => {

                  if (!user) {
                    return;
                  }


                  window.clearTimeout(
                    timeout
                  );


                  if (unsubscribe) {
                    unsubscribe();
                  }


                  resolve(user);

                }
              );

          }
        );

    } else {

      firebaseUser =
        firebaseAuth.currentUser;

    }


    firebaseReady =
      Boolean(
        firebaseUser
      );


    if (
      firebaseReady
    ) {

      console.info(
        "Made of Honour shared album connected.",
        firebaseUser.uid
      );

    }


    return firebaseReady;

  } catch (error) {

    console.error(
      "Firebase setup failed:",
      error
    );


    firebaseReady =
      false;

    firebaseUser =
      null;


    return false;

  }

}


/* =========================================================
   CAMERA STATUS
   ========================================================= */

function setCameraStatus(
  message,
  isError = false
) {

  const status =
    $("#camera-cloud-status");


  if (!status) {
    return;
  }


  status.textContent =
    message;


  status.style.color =
    isError
      ? "#9b3f3f"
      : "";

}


/* =========================================================
   LOCAL PHOTO FALLBACK
   ========================================================= */

function getLocalPhotos() {

  try {

    const stored =
      localStorage.getItem(
        CONFIG.storageKeys.photos
      );


    const parsed =
      JSON.parse(
        stored || "[]"
      );


    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch (error) {

    return [];

  }

}


function saveLocalPhoto(
  dataURL
) {

  const photos =
    getLocalPhotos();


  const photo = {

    id:
      window.crypto &&
      typeof window.crypto.randomUUID ===
        "function"

        ? window.crypto.randomUUID()

        : `${Date.now()}-${Math.random()}`,

    src:
      dataURL,

    guest:
      localStorage.getItem(
        CONFIG.storageKeys.guest
      ) || "Guest",

    timestamp:
      new Date().toISOString()

  };


  photos.unshift(
    photo
  );


  try {

    localStorage.setItem(
      CONFIG.storageKeys.photos,
      JSON.stringify(
        photos.slice(0, 12)
      )
    );

  } catch (error) {

    try {

      localStorage.setItem(
        CONFIG.storageKeys.photos,
        JSON.stringify(
          photos.slice(0, 5)
        )
      );

    } catch (storageError) {

      console.warn(
        "Could not save local photograph.",
        storageError
      );

    }

  }


  return photo;

}


/* =========================================================
   DATA URL → BLOB
   ========================================================= */

function dataURLToBlob(
  dataURL
) {

  const parts =
    dataURL.split(",");


  const header =
    parts[0] || "";


  const base64 =
    parts[1] || "";


  const mimeMatch =
    header.match(
      /data:(.*?);base64/
    );


  const mime =
    mimeMatch?.[1] ||
    "image/jpeg";


  const binary =
    atob(base64);


  const bytes =
    new Uint8Array(
      binary.length
    );


  for (
    let index = 0;
    index < binary.length;
    index++
  ) {

    bytes[index] =
      binary.charCodeAt(index);

  }


  return new Blob(
    [bytes],
    {
      type: mime
    }
  );

}


/* =========================================================
   SHARED ALBUM UPLOAD
   ========================================================= */

async function uploadPhotoToSharedAlbum(
  dataURL
) {

  /*
    Always make sure Firebase is ready
    before attempting an upload.
  */

  if (
    !firebaseReady ||
    !firebaseUser ||
    !firebaseStorage ||
    !firebaseDatabase
  ) {

    const connected =
      await initFirebase();


    if (!connected) {

      throw new Error(
        "SHARED_ALBUM_NOT_CONFIGURED"
      );

    }

  }


  const photoId =
    window.crypto &&
    typeof window.crypto.randomUUID ===
      "function"

      ? window.crypto.randomUUID()

      : `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;


  const storagePath =
    `guest-album/${firebaseUser.uid}/${photoId}.jpg`;


  const blob =
    dataURLToBlob(
      dataURL
    );


  /*
    Make absolutely sure the object being
    uploaded is JPEG, because Storage rules
    require image/jpeg.
  */

  const jpegBlob =
    blob.type === "image/jpeg"
      ? blob
      : await convertBlobToJPEG(
          blob
        );


  if (
    jpegBlob.size >=
    8 * 1024 * 1024
  ) {

    throw new Error(
      "PHOTO_TOO_LARGE"
    );

  }


  const storageReference =
    firebaseStorage.ref(
      storagePath
    );


  /*
    Upload the actual photograph.
  */

  await storageReference.put(
    jpegBlob,
    {
      contentType:
        "image/jpeg",

      customMetadata: {
        guest:
          localStorage.getItem(
            CONFIG.storageKeys.guest
          ) || "Guest"
      }
    }
  );


  /*
    Get a public Firebase-authenticated
    download URL for the album.
  */

  const downloadURL =
    await storageReference.getDownloadURL();


  /*
    Use a Firestore server timestamp so
    every guest sees a consistent ordering.
  */

  await firebaseDatabase
    .collection("guestAlbum")
    .doc(photoId)
    .set({

      id:
        photoId,

      src:
        downloadURL,

      storagePath:
        storagePath,

      guest:
        localStorage.getItem(
          CONFIG.storageKeys.guest
        ) || "Guest",

      ownerUid:
        firebaseUser.uid,

      timestamp:
        window.firebase.firestore.FieldValue.serverTimestamp()

    });


  return photoId;

}


/* =========================================================
   CONVERT ANY IMAGE TO JPEG
   ========================================================= */

function convertBlobToJPEG(
  blob
) {

  return new Promise(
    (resolve, reject) => {

      const objectURL =
        URL.createObjectURL(
          blob
        );


      const image =
        new Image();


      image.onload =
        () => {

          URL.revokeObjectURL(
            objectURL
          );


          const canvas =
            document.createElement(
              "canvas"
            );


          const maxDimension =
            1920;


          let width =
            image.naturalWidth;


          let height =
            image.naturalHeight;


          if (
            width >
              maxDimension ||
            height >
              maxDimension
          ) {

            const scale =
              Math.min(
                maxDimension /
                  width,
                maxDimension /
                  height
              );


            width =
              Math.round(
                width * scale
              );


            height =
              Math.round(
                height * scale
              );

          }


          canvas.width =
            width;


          canvas.height =
            height;


          const context =
            canvas.getContext(
              "2d"
            );


          if (!context) {

            reject(
              new Error(
                "Could not create image canvas."
              )
            );

            return;

          }


          context.drawImage(
            image,
            0,
            0,
            width,
            height
          );


          canvas.toBlob(
            result => {

              if (!result) {

                reject(
                  new Error(
                    "Could not convert photograph to JPEG."
                  )
                );

                return;

              }


              resolve(
                result
              );

            },
            "image/jpeg",
            0.88
          );

        };


      image.onerror =
        () => {

          URL.revokeObjectURL(
            objectURL
          );


          reject(
            new Error(
              "Could not process photograph."
            )
          );

        };


      image.src =
        objectURL;

    }
  );

}


/* =========================================================
   DELETE SHARED PHOTO
   ========================================================= */

async function deleteSharedPhoto(
  photo
) {

  if (
    !firebaseReady ||
    !firebaseUser ||
    !firebaseDatabase ||
    !firebaseStorage
  ) {
    return;
  }


  /*
    Safety check:
    only the guest who owns the photograph
    should be able to delete it.
  */

  if (
    photo.ownerUid &&
    photo.ownerUid !==
      firebaseUser.uid
  ) {

    throw new Error(
      "NOT_PHOTO_OWNER"
    );

  }


  if (
    photo.storagePath
  ) {

    try {

      await firebaseStorage
        .ref(
          photo.storagePath
        )
        .delete();

    } catch (error) {

      /*
        If the image is already gone from
        Storage, continue deleting metadata.
      */

      if (
        error.code !==
        "storage/object-not-found"
      ) {

        throw error;

      }

    }

  }


  await firebaseDatabase
    .collection("guestAlbum")
    .doc(photo.id)
    .delete();

}


/* =========================================================
   CAMERA
   ========================================================= */

let cameraStream = null;

let pendingPhoto = null;


/* =========================================================
   START CAMERA
   ========================================================= */

async function startCamera() {

  const video =
    $("#camera-video");

  const message =
    $("#camera-message");

  const captureButton =
    $("#capture-photo");


  if (!video) {
    return;
  }


  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    if (message) {

      message.textContent =
        "Camera access is not supported here. Choose a photo below or open the website over HTTPS.";

      message.classList.remove(
        "hidden"
      );

    }


    setCameraStatus(
      "Your browser cannot open the live camera. You can still choose a photo from your device.",
      true
    );


    return;

  }


  try {

    stopCamera();


    cameraStream =
      await navigator.mediaDevices.getUserMedia(
        {
          video: {
            facingMode: {
              ideal: "environment"
            },

            width: {
              ideal: 1920
            },

            height: {
              ideal: 1080
            }
          },

          audio: false

        }
      );


    video.srcObject =
      cameraStream;


    await video.play().catch(
      () => {}
    );


    if (message) {

      message.classList.add(
        "hidden"
      );

    }


    if (captureButton) {

      captureButton.disabled =
        false;

    }


    setCameraStatus(
      firebaseReady
        ? "Connected. Kept photographs appear in the shared album."
        : ""
    );

  } catch (error) {

    console.error(
      "Camera error:",
      error
    );


    if (message) {

      if (
        error.name ===
        "NotAllowedError"
      ) {

        message.textContent =
          "Camera permission was declined. Allow camera access in your browser settings and try again.";

      } else if (
        error.name ===
        "NotFoundError"
      ) {

        message.textContent =
          "No camera was found on this device.";

      } else {

        message.textContent =
          "We couldn't open the camera. Use HTTPS or localhost and make sure a camera is available.";

      }


      message.classList.remove(
        "hidden"
      );

    }


    setCameraStatus(
      "The camera could not be opened. You can choose a photograph from your device instead.",
      true
    );

  }

}


/* =========================================================
   STOP CAMERA
   ========================================================= */

function stopCamera() {

  if (cameraStream) {

    cameraStream
      .getTracks()
      .forEach(
        track => {

          track.stop();

        }
      );


    cameraStream =
      null;

  }


  const video =
    $("#camera-video");


  if (video) {

    video.srcObject =
      null;

  }


  const captureButton =
    $("#capture-photo");


  if (captureButton) {

    captureButton.disabled =
      true;

  }

}


/* =========================================================
   RESET CAPTURE RESULT
   ========================================================= */

function resetCaptureResult() {

  pendingPhoto =
    null;


  const result =
    $("#capture-result");


  if (result) {

    result.hidden =
      true;

  }


  const capturedImage =
    $("#captured-image");


  if (capturedImage) {

    capturedImage.removeAttribute(
      "src"
    );

  }

}


/* =========================================================
   CAPTURE CAMERA FRAME
   ========================================================= */

function capturePhoto() {

  const video =
    $("#camera-video");

  const canvas =
    $("#camera-canvas");

  const flash =
    $("#flash");


  if (
    !video ||
    !canvas ||
    !cameraStream ||
    !video.videoWidth
  ) {

    return;

  }


  canvas.width =
    video.videoWidth;


  canvas.height =
    video.videoHeight;


  const context =
    canvas.getContext(
      "2d"
    );


  if (!context) {
    return;
  }


  /*
    Mirror the saved photograph so it
    matches the live viewfinder.
  */

  context.save();


  context.translate(
    canvas.width,
    0
  );


  context.scale(
    -1,
    1
  );


  context.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );


  context.restore();


  pendingPhoto =
    canvas.toDataURL(
      "image/jpeg",
      0.88
    );


  const capturedImage =
    $("#captured-image");


  if (capturedImage) {

    capturedImage.src =
      pendingPhoto;

  }


  const result =
    $("#capture-result");


  if (result) {

    result.hidden =
      false;

  }


  if (flash) {

    flash.classList.remove(
      "fire"
    );


    void flash.offsetWidth;


    flash.classList.add(
      "fire"
    );

  }


  const frameCount =
    $("#frame-count");


  if (frameCount) {

    const current =
      parseInt(
        frameCount.textContent,
        10
      ) || 1;


    frameCount.textContent =
      String(
        current + 1
      ).padStart(
        2,
        "0"
      );

  }


  setCameraStatus(
    firebaseReady
      ? "Frame ready. Keep it if it belongs in the album."
      : ""
  );

}


/* =========================================================
   DEVICE PHOTO FALLBACK
   ========================================================= */

function handleCameraFile(
  event
) {

  const file =
    event.target.files?.[0];


  if (!file) {
    return;
  }


  if (
    !file.type.startsWith(
      "image/"
    )
  ) {

    setCameraStatus(
      "Please choose an image.",
      true
    );


    event.target.value =
      "";


    return;

  }


  const reader =
    new FileReader();


  reader.onload =
    () => {

      pendingPhoto =
        reader.result;


      const capturedImage =
        $("#captured-image");


      if (capturedImage) {

        capturedImage.src =
          pendingPhoto;

      }


      const result =
        $("#capture-result");


      if (result) {

        result.hidden =
          false;

      }


      const frameCount =
        $("#frame-count");


      if (frameCount) {

        const current =
          parseInt(
            frameCount.textContent,
            10
          ) || 1;


        frameCount.textContent =
          String(
            current + 1
          ).padStart(
            2,
            "0"
          );

      }


      setCameraStatus(
        firebaseReady
          ? "Photograph ready. Keep it if it belongs in the album."
          : ""
      );

    };


  reader.onerror =
    () => {

      setCameraStatus(
        "The photograph could not be read.",
        true
      );

    };


  reader.readAsDataURL(
    file
  );

}


/* =========================================================
   CAMERA PAGE
   ========================================================= */

function initCamera() {

  const video =
    $("#camera-video");


  if (!video) {
    return;
  }


  /*
    Connect to Firebase in the background.
  */

  setCameraStatus(
    "Connecting to the shared album…"
  );


  initFirebase()
    .then(
      connected => {

        if (connected) {

          setCameraStatus(
            "Connected. Kept photographs appear in the shared album."
          );

        } else {

          setCameraStatus(
            "",
            true
          );

        }

      }
    )
    .catch(
      error => {

        console.error(
          "Firebase connection error:",
          error
        );


        setCameraStatus(
          "The camera is ready, but the shared album is not connected.",
          true
        );

      }
    );


  $("#start-camera")?.addEventListener(
    "click",
    async () => {

      enableMusicAfterInteraction();

      await startCamera();

    }
  );


  $("#stop-camera")?.addEventListener(
    "click",
    () => {

      stopCamera();

    }
  );


  $("#capture-photo")?.addEventListener(
    "click",
    () => {

      capturePhoto();

    }
  );


  $("#camera-upload")?.addEventListener(
    "change",
    handleCameraFile
  );


  /*
    RETAKE:
    Hide the captured frame and immediately
    reopen the live camera.
  */

  $("#retake-photo")?.addEventListener(
    "click",
    async () => {

      enableMusicAfterInteraction();


      resetCaptureResult();


      setCameraStatus(
        firebaseReady
          ? "Ready for another frame."
          : "",
        !firebaseReady
      );


      /*
        If the camera was stopped after capture,
        start it again.
      */

      if (
        !cameraStream
      ) {

        await startCamera();

      } else {

        const captureButton =
          $("#capture-photo");


        if (captureButton) {

          captureButton.disabled =
            false;

        }

      }

    }
  );


  /*
    ADD TO ALBUM
  */

  $("#keep-photo")?.addEventListener(
    "click",
    async () => {

      if (!pendingPhoto) {
        return;
      }


      const button =
        $("#keep-photo");


      if (!button) {
        return;
      }


      const originalHTML =
        button.innerHTML;


      button.disabled =
        true;


      button.innerHTML =
        "Saving <span>…</span>";


      setCameraStatus(
        "Adding your frame to the shared wedding roll…"
      );


      try {

        /*
          If Firebase was still connecting when
          the guest pressed the button, wait for it.
        */

        if (
          !firebaseReady
        ) {

          const connected =
            await initFirebase();


          if (!connected) {

            throw new Error(
              "SHARED_ALBUM_NOT_CONFIGURED"
            );

          }

        }


        /*
          Upload the actual photograph.
        */

        await uploadPhotoToSharedAlbum(
          pendingPhoto
        );


        setCameraStatus(
          "Added to the shared album."
        );


        resetCaptureResult();


        stopCamera();


        /*
          Give the status message a moment to
          register before moving to the roll.
        */

        window.setTimeout(
          () => {

            window.location.href =
              "album.html";

          },
          350
        );


      } catch (error) {

        console.error(
          "Photo upload failed:",
          error
        );


        if (
          error.message ===
          "SHARED_ALBUM_NOT_CONFIGURED"
        ) {

          setCameraStatus(
            "The camera works, but the shared album is not connected. Add your Firebase configuration to script.js.",
            true
          );

        } else if (
          error.message ===
          "PHOTO_TOO_LARGE"
        ) {

          setCameraStatus(
            "That photograph is too large. Please choose or capture a smaller image.",
            true
          );

        } else if (
          error.code ===
          "permission-denied"
        ) {

          setCameraStatus(
            "Firebase denied the upload. Check Anonymous Authentication, Firestore and Storage rules.",
            true
          );

        } else {

          setCameraStatus(
            "The frame could not be added. Check your Firebase connection and try again.",
            true
          );

        }

      } finally {

        button.disabled =
          false;


        button.innerHTML =
          originalHTML;

      }

    }
  );


  window.addEventListener(
    "beforeunload",
    stopCamera
  );

}


/* =========================================================
   ALBUM DATE FORMATTING
   ========================================================= */

function formatPhotoDate(
  value
) {

  let date;


  try {

    if (
      value &&
      typeof value.toDate ===
        "function"
    ) {

      date =
        value.toDate();

    } else {

      date =
        new Date(
          value
        );

    }

  } catch (error) {

    return "";

  }


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }


  return new Intl.DateTimeFormat(
    "en-ZA",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(
    date
  );

}


/* =========================================================
   ALBUM RENDERING
   ========================================================= */

function renderAlbum(
  grid,
  photos
) {

  if (!grid) {
    return;
  }


  const title =
    $("#album-title");


  if (title) {

    title.textContent =
      photos.length
        ? `${photos.length} ${
            photos.length === 1
              ? "frame"
              : "frames"
          }.`
        : "A few frames.";

  }


  if (!photos.length) {

    grid.innerHTML = `
      <div
        class="album-empty"
        style="grid-column:1/-1"
      >

        <div>

          <p class="eyebrow">
            Nothing here yet
          </p>

          <h3>
            The roll is waiting.
          </h3>

          <p>
            Take a frame and, if you like it,
            keep it here for everyone to see.
          </p>

          <a
            class="button button-dark"
            href="camera.html"
          >
            Take a photo
            <span>↗</span>
          </a>

        </div>

      </div>
    `;


    return;

  }


  grid.innerHTML =
    photos.map(
      (photo, index) => `
        <figure class="album-item">

          <button
            class="album-delete"
            type="button"
            data-delete-photo="${escapeHTML(
              photo.id
            )}"
            aria-label="Delete photograph"
          >
            ×
          </button>

          <img
            src="${escapeHTML(
              photo.src
            )}"
            alt="Wedding photograph ${
              index + 1
            }"
            data-view-photo="${escapeHTML(
              photo.id
            )}"
            loading="lazy"
          >

          <figcaption class="album-meta">
            Frame
            ${String(
              photos.length -
                index
            ).padStart(
              2,
              "0"
            )}
            ·
            ${escapeHTML(
              photo.guest ||
                "Guest"
            )}
            ·
            ${escapeHTML(
              formatPhotoDate(
                photo.timestamp
              )
            )}
          </figcaption>

        </figure>
      `
    ).join("");


  /*
    Delete buttons
  */

  $$(
    "[data-delete-photo]",
    grid
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        async () => {

          const photo =
            photos.find(
              item =>
                item.id ===
                button.dataset.deletePhoto
            );


          if (!photo) {
            return;
          }


          if (
            !firebaseReady ||
            !firebaseUser
          ) {

            return;

          }


          if (
            photo.ownerUid &&
            photo.ownerUid !==
              firebaseUser.uid
          ) {

            alert(
              "Only the guest who added this frame can remove it."
            );


            return;

          }


          const confirmed =
            window.confirm(
              "Remove this photograph from the shared album?"
            );


          if (!confirmed) {
            return;
          }


          button.disabled =
            true;


          try {

            await deleteSharedPhoto(
              photo
            );

          } catch (error) {

            console.error(
              "Could not delete photo:",
              error
            );


            alert(
              "That frame could not be removed right now."
            );


            button.disabled =
              false;

          }

        }
      );

    }
  );


  /*
    Photo viewer
  */

  $$(
    "[data-view-photo]",
    grid
  ).forEach(
    image => {

      image.addEventListener(
        "click",
        () => {

          openAlbumViewer(
            image.src,
            image.alt
          );

        }
      );

    }
  );

}


/* =========================================================
   ALBUM PAGE
   ========================================================= */

async function initAlbum() {

  const grid =
    $("#album-grid");


  if (!grid) {
    return;
  }


  grid.innerHTML = `
    <div
      class="album-empty"
      style="grid-column:1/-1"
    >

      <div>

        <p class="eyebrow">
          Connecting
        </p>

        <h3>
          Opening the roll.
        </h3>

        <p>
          Give us a moment.
        </p>

      </div>

    </div>
  `;


  const connected =
    await initFirebase();


  if (!connected) {

    grid.innerHTML = `
      <div
        class="album-empty"
        style="grid-column:1/-1"
      >

        <div>

          <p class="eyebrow">
            Shared album offline
          </p>

          <h3>
            The camera is ready.
          </h3>

          <p>
            Add your Firebase configuration
            in script.js and enable Anonymous
            Authentication, Firestore and Storage
            to make this album genuinely shared
            between guests.
          </p>

          <a
            class="button button-dark"
            href="camera.html"
          >
            Back to camera
            <span>↗</span>
          </a>

        </div>

      </div>
    `;


    return;

  }


  if (albumUnsubscribe) {

    albumUnsubscribe();

    albumUnsubscribe =
      null;

  }


  try {

    /*
      Listen to the entire guest album in
      real time. Every guest sees new frames
      without refreshing.
    */

    const collection =
      firebaseDatabase
        .collection(
          "guestAlbum"
        )
        .orderBy(
          "timestamp",
          "desc"
        );


    albumUnsubscribe =
      collection.onSnapshot(
        snapshot => {

          const photos =
            snapshot.docs
              .map(
                document => ({
                  id:
                    document.id,

                  ...document.data()
                })
              )
              .filter(
                photo =>
                  photo.src &&
                  photo.storagePath
              );


          renderAlbum(
            grid,
            photos
          );

        },

        error => {

          console.error(
            "Shared album listener failed:",
            error
          );


          grid.innerHTML = `
            <div
              class="album-empty"
              style="grid-column:1/-1"
            >

              <div>

                <p class="eyebrow">
                  Something went wrong
                </p>

                <h3>
                  The roll could not be opened.
                </h3>

                <p>
                  Check your Firebase Firestore
                  rules and make sure the guest
                  album collection is readable.
                </p>

              </div>

            </div>
          `;

        }
      );

  } catch (error) {

    console.error(
      "Could not open album:",
      error
    );


    grid.innerHTML = `
      <div
        class="album-empty"
        style="grid-column:1/-1"
      >

        <div>

          <p class="eyebrow">
            Something went wrong
          </p>

          <h3>
            The roll could not be opened.
          </h3>

          <p>
            Check your Firebase configuration
            and Firestore setup.
          </p>

        </div>

      </div>
    `;

  }


  /*
    Clear only photographs belonging
    to the current guest.
  */

  const clearButton =
    $("#clear-album");


  if (clearButton) {

    clearButton.addEventListener(
      "click",
      async () => {

        if (
          !firebaseReady ||
          !firebaseUser
        ) {

          return;

        }


        try {

          const snapshot =
            await firebaseDatabase
              .collection(
                "guestAlbum"
              )
              .where(
                "ownerUid",
                "==",
                firebaseUser.uid
              )
              .get();


          const photos =
            [];


          snapshot.forEach(
            document => {

              photos.push({
                id:
                  document.id,

                ...document.data()
              });

            }
          );


          if (!photos.length) {

            alert(
              "You have not added any photographs yet."
            );


            return;

          }


          const confirmed =
            window.confirm(
              "Clear the photographs you added to the shared album?"
            );


          if (!confirmed) {
            return;
          }


          clearButton.disabled =
            true;


          for (
            const photo of photos
          ) {

            try {

              await deleteSharedPhoto(
                photo
              );

            } catch (error) {

              console.error(
                "Could not remove photograph:",
                error
              );

            }

          }

        } catch (error) {

          console.error(
            "Could not clear album:",
            error
          );


          alert(
            "The photographs could not be cleared right now."
          );

        } finally {

          clearButton.disabled =
            false;

        }

      }
    );

  }

}


/* =========================================================
   ALBUM PHOTO VIEWER
   ========================================================= */

function openAlbumViewer(
  source,
  alt
) {

  let mount =
    $("#album-viewer");


  if (!mount) {

    mount =
      document.createElement(
        "div"
      );


    mount.id =
      "album-viewer";


    document.body.appendChild(
      mount
    );

  }


  mount.innerHTML = `
    <div
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Wedding photograph"
    >

      <div class="modal-panel">

        <button
          class="modal-close"
          type="button"
          aria-label="Close photograph"
        >
          ×
        </button>

        <img
          src="${escapeHTML(source)}"
          alt="${escapeHTML(
            alt ||
              "Wedding photograph"
          )}"
        >

      </div>

    </div>
  `;


  document.body.style.overflow =
    "hidden";


  const close =
    () => {

      mount.innerHTML =
        "";

      document.body.style.overflow =
        "";

    };


  const closeButton =
    $(".modal-close", mount);


  closeButton?.addEventListener(
    "click",
    close
  );


  const backdrop =
    $(".modal-backdrop", mount);


  backdrop?.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        backdrop
      ) {

        close();

      }

    }
  );


  const escapeHandler =
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        close();


        document.removeEventListener(
          "keydown",
          escapeHandler
        );

      }

    };


  document.addEventListener(
    "keydown",
    escapeHandler
  );

}


/* =========================================================
   CLEANUP
   ========================================================= */

window.addEventListener(
  "pagehide",
  () => {

    saveMusicPosition();

    stopCamera();

  }
);


/* =========================================================
   START EVERYTHING
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    ensureFavicon();

    setCoupleDetails();

    buildMusicControl();

    buildHeader();

    buildFooter();

    pageTransitions();

    revealOnScroll();

    initCookie();

    initLogin();

    initLoading();

    initImageModal();

    initNotes();

    initCamera();

    initAlbum();

  }
);