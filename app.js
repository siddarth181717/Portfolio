(() => {
  "use strict";

  // Hide Page Loader
  window.addEventListener("load", () => {
    const loader = document.getElementById("pageLoader");
    if (loader) {
      setTimeout(() => {
        loader.classList.add("hidden");
      }, 400);
    }
  });

  // 1. Interactive 3D Hero Avatar setup with Three.js & Mouse Tracking
  const canvas = document.getElementById("heroAvatarCanvas");
  const avatarImg = document.getElementById("heroAvatar");
  const avatarWrapper = document.getElementById("avatarWrapper");

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener("mousemove", (e) => {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    mouseX = (e.clientX - windowHalfX) / windowHalfX;
    mouseY = (e.clientY - windowHalfY) / windowHalfY;
  });

  // Parallax fallback/enhancement on 2D avatar image
  if (avatarWrapper && avatarImg) {
    const animateAvatarImage = () => {
      targetX += (mouseX - targetX) * 0.08;
      targetY += (mouseY - targetY) * 0.08;

      const tiltX = targetY * 20; // pitch
      const tiltY = targetX * -20; // yaw
      const moveX = targetX * 12;
      const moveY = targetY * 12;

      avatarImg.style.transform = `translate3d(${moveX}px, ${moveY}px, 0px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.04)`;

      requestAnimationFrame(animateAvatarImage);
    };
    animateAvatarImage();
  }

  // Three.js interactive 3D scene overlay
  if (canvas && typeof THREE !== "undefined") {
    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const resizeCanvas = () => {
        if (!avatarWrapper) return;
        const rect = avatarWrapper.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height);
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
      };
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      // Create a stylized 3D sphere group overlay for eye/face directional 3D lighting & particle sparks
      const group = new THREE.Group();

      // Ambient & Spot Lights following cursor
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const pointLight1 = new THREE.PointLight(0xd946ef, 2.5, 20);
      pointLight1.position.set(2, 2, 3);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0x38bdf8, 2.0, 20);
      pointLight2.position.set(-2, -2, 3);
      scene.add(pointLight2);

      // Floating 3D particles ring around head
      const particleGeo = new THREE.BufferGeometry();
      const count = 40;
      const positions = new Float32Array(count * 3);
      const scales = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 1.8 + Math.random() * 0.5;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        scales[i] = Math.random() * 0.05 + 0.02;
      }

      particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const particleMat = new THREE.PointsMaterial({
        color: 0xf97316,
        size: 0.08,
        transparent: true,
        opacity: 0.7
      });

      const particleSystem = new THREE.Points(particleGeo, particleMat);
      group.add(particleSystem);
      scene.add(group);

      const renderScene = () => {
        group.rotation.y += 0.005;
        group.rotation.x = targetY * 0.3;
        group.rotation.y = targetX * 0.3;

        pointLight1.position.x = targetX * 3 + 2;
        pointLight1.position.y = -targetY * 3 + 2;

        renderer.render(scene, camera);
        requestAnimationFrame(renderScene);
      };
      renderScene();
    } catch (e) {
      console.log("Three.js initialization fallback:", e);
    }
  }

  // 2. Parallax Motion for Floating 3D Shapes in About Section
  const floatingShapes = document.querySelectorAll(".floating-shape");
  if (floatingShapes.length > 0) {
    window.addEventListener("scroll", () => {
      const scrolled = window.scrollY;
      floatingShapes.forEach((shape) => {
        const speed = parseFloat(shape.getAttribute("data-parallax") || "0.05");
        shape.style.transform = `translateY(${scrolled * speed}px)`;
      });
    });
  }

  // 3. Magnetic Pill Button Effect
  const magneticBtns = document.querySelectorAll(".magnetic");
  magneticBtns.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translate(0px, 0px)";
    });
  });

  // 4. Testimonials Slider Drag / Horizontal Scroll
  const testimonialTrack = document.getElementById("testimonialTrack");
  if (testimonialTrack) {
    let isDown = false;
    let startX;
    let scrollLeft;

    testimonialTrack.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - testimonialTrack.offsetLeft;
      scrollLeft = testimonialTrack.scrollLeft;
    });

    testimonialTrack.addEventListener("mouseleave", () => {
      isDown = false;
    });

    testimonialTrack.addEventListener("mouseup", () => {
      isDown = false;
    });

    testimonialTrack.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - testimonialTrack.offsetLeft;
      const walk = (x - startX) * 2;
      testimonialTrack.scrollLeft = scrollLeft - walk;
    });
  }

  // 5. Working Contact Form Handler with FormSubmit AJAX
  const contactForm = document.getElementById("contactForm");
  const sendBtn = document.getElementById("sendBtn");
  const responseMsg = document.getElementById("formResponseMsg");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btnText = sendBtn ? sendBtn.querySelector(".btn-text") : null;
      const btnSpinner = sendBtn ? sendBtn.querySelector(".btn-spinner") : null;

      if (btnText && btnSpinner) {
        btnText.style.display = "none";
        btnSpinner.style.display = "inline-block";
      }
      if (sendBtn) sendBtn.disabled = true;

      const formData = new FormData(contactForm);

      try {
        const response = await fetch("https://formsubmit.co/ajax/sonisiddarth890@gmail.com", {
          method: "POST",
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(Object.fromEntries(formData))
        });

        if (response.ok) {
          if (responseMsg) {
            responseMsg.className = "form-response-msg success";
            responseMsg.innerHTML = "✨ Thank you! Your message has been sent directly to Siddarth's email.";
          }
          contactForm.reset();
        } else {
          throw new Error("Form submission failed");
        }
      } catch (error) {
        console.error("Form submission error:", error);
        if (responseMsg) {
          responseMsg.className = "form-response-msg success";
          responseMsg.innerHTML = "✨ Thank you! Sending message to Siddarth...";
        }
        contactForm.submit();
      } finally {
        if (btnText && btnSpinner) {
          btnText.style.display = "inline-block";
          btnSpinner.style.display = "none";
        }
        if (sendBtn) sendBtn.disabled = false;
      }
    });
  }

  // 6. Project Modal Lightbox
  const modal = document.getElementById("projectModal");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalCategory = document.getElementById("modalCategory");
  const modalClose = document.getElementById("modalClose");

  const projectImages = document.querySelectorAll(".case-img-large img, .case-img-small img, .gallery-card img");
  projectImages.forEach((img) => {
    img.style.cursor = "pointer";
    img.addEventListener("click", () => {
      if (modal && modalImg) {
        modalImg.src = img.src;
        if (modalTitle) modalTitle.textContent = img.alt || "3D Render Showcase";
        if (modalCategory) modalCategory.textContent = "Interactive 3D Case Study";
        modal.showModal();
      }
    });
  });

  if (modalClose && modal) {
    modalClose.addEventListener("click", () => {
      modal.close();
    });

    modal.addEventListener("click", (e) => {
      const rect = modal.getBoundingClientRect();
      const inDialog =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inDialog) {
        modal.close();
      }
    });
  }

  // 7. 3D Scroll Stacking Cards Effect for Projects Section
  const cards = document.querySelectorAll(".case-card");
  if (cards.length > 0) {
    const updateCardStacking = () => {
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const nextCard = cards[index + 1];

        if (nextCard) {
          const nextRect = nextCard.getBoundingClientRect();
          // Calculate overlap distance as next card scrolls upward over current card
          const overlap = Math.max(0, rect.bottom - nextRect.top);
          const maxOverlap = window.innerHeight * 0.4;
          const progress = Math.min(1, Math.max(0, overlap / maxOverlap));

          const scale = 1 - progress * 0.05;
          const blur = progress * 2.5;
          const opacity = 1 - progress * 0.25;

          card.style.transform = `scale(${scale})`;
          card.style.filter = `blur(${blur}px)`;
          card.style.opacity = `${opacity}`;
        } else {
          card.style.transform = `scale(1)`;
          card.style.filter = `none`;
          card.style.opacity = `1`;
        }
      });
    };

    window.addEventListener("scroll", updateCardStacking, { passive: true });
    updateCardStacking();
  }
})();
