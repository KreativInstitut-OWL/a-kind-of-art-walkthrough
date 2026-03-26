import {
  Script,
  Texture,
  PIXELFORMAT_R8_G8_B8,
  FILTER_LINEAR,
  FILTER_LINEAR_MIPMAP_LINEAR,
  ADDRESS_CLAMP_TO_EDGE,
  Sound,
} from "playcanvas";

/**
 * Creates and manages a video texture, loading from an asset or URL, and triggering an event when ready.
 */
export class VideoTexture extends Script {
  /**
   * MP4 video asset to play back on this video texture.
   *
   * @attribute
   * @title Video Asset
   * @type {pc.Asset}
   */
  videoAsset;

  /**
   * URL to use if there is no video asset selected.
   *
   * @attribute
   * @title Video Url
   * @type {string}
   */
  videoUrl;

  /**
   * Event that is fired as soon as the video texture is ready to play.
   *
   * @attribute
   * @title Play Event
   * @type {string}
   * @default ''
   */
  playEvent = "";

  /**
   * If true, also connect video audio directly to destination for debugging.
   *
   * @attribute
   * @title Debug: Direct Output
   * @type {boolean}
   * @default false
   */
  debugDirectOutput = false;

  // Proximity playback control
  /** Minimum distance to start playing (units) */
  _minDistance = 5;
  /** Hysteresis to prevent chattering at threshold (units) */
  _distanceHysteresis = 0.5;
  /** Cached squared thresholds (computed lazily) */
  _playDistanceSq = null;
  _pauseDistanceSq = null;
  /** Cached Player entity (found by name) */
  _playerEntity = null;
  /** Whether pointer is currently locked (menu closed) */
  _isPointerLocked = false;
  /** Whether player is currently within distance gate (with hysteresis) */
  _isWithinDistance = false;
  /** Accumulator to throttle player lookup */
  _timeSinceLastPlayerLookup = 0;

  initialize() {
    const app = this.app;


    if (!this.entity.sound) {
      this.entity.addComponent("sound", {
        volume: 1,
        positional: true,
      });
    } else {
      this.entity.sound.positional = true;
      this.entity.sound.volume = 1;
    }

    const sound = this.entity.sound;
    // Looser attenuation for easier testing/audibility
    sound.distanceModel = "inverse";
    sound.refDistance = 1;
    sound.maxDistance = 1000;
    sound.rollOffFactor = 1;

    //   distanceModel: sound.distanceModel,
    //   refDistance: sound.refDistance,
    //   maxDistance: sound.maxDistance,
    //   rollOffFactor: sound.rollOffFactor,
    // });
    if (!sound.slot("video")) {
      sound.addSlot("video", {
        loop: true,
        autoPlay: false,
        volume: 1,
      });
    }

    // Create video element
    const video = document.createElement("video");
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.autoplay = false;
    video.preload = "auto";
    video.volume = 1.0;

    //   loop: video.loop,
    //   muted: video.muted,
    //   autoplay: video.autoplay,
    //   playsInline: video.playsInline,
    //   volume: video.volume,
    // });

    // Hidden and silent in DOM
    Object.assign(video.style, {
      width: "1px",
      height: "1px",
      position: "absolute",
      opacity: "0",
      zIndex: "-1000",
      pointerEvents: "none",
    });

    document.body.appendChild(video);

    // Create the texture
    this.videoTexture = new Texture(app.graphicsDevice, {
      format: PIXELFORMAT_R8_G8_B8,
      minFilter: FILTER_LINEAR_MIPMAP_LINEAR,
      magFilter: FILTER_LINEAR,
      addressU: ADDRESS_CLAMP_TO_EDGE,
      addressV: ADDRESS_CLAMP_TO_EDGE,
      mipmaps: true,
    });

    this.videoTexture.setSource(video);
    this.video = video;
    this._audioConnected = false;
    this._cleanupAudio = null;

    // Initialize pointer lock state at startup
    const canvas = app.graphicsDevice.canvas;
    const rootNode = canvas.getRootNode();
    this._isPointerLocked = !!rootNode.pointerLockElement;

    const getAudioContext = () =>
      app.systems.sound?.manager?.context || app.systems.sound?.context;

    // Attach resume listeners ASAP to satisfy autoplay policies
    const attachResumeHandlers = () => {
      if (this._resumeHandlersAttached) return;
      this._resumeHandlersAttached = true;
      const handler = () => {
        const context = getAudioContext();
        if (!context) {
          console.warn(
            "[VideoTexture] No AudioContext available on resume handler"
          );
          return;
        }
        //   "[VideoTexture] User gesture detected. Context state before:",
        //   context.state
        // );
        context
          .resume()
          .then(() => {
            //   "[VideoTexture] AudioContext resumed. State:",
            //   context.state
            // );
            video.muted = false;
            video
              .play()
              .catch(() => {})
              .then(() => {
                //   "[VideoTexture] video.play() ok. muted:",
                //   video.muted
                // );
                video.pause();
                // seek to 0
                video.currentTime = 0;
              });
            const slot = sound.slot("video");
            if (slot && !slot.playing) {
              try {
                slot.play();

              } catch (e) {
                console.warn(
                  "[VideoTexture] slot.play() failed after resume:",
                  e
                );
              }
            }
          })
          .catch((e) => {
            console.warn("[VideoTexture] context.resume() failed:", e);
          });
        window.removeEventListener("pointerdown", handler);
        window.removeEventListener("touchend", handler);
        window.removeEventListener("keydown", handler);
      };
      window.addEventListener("pointerdown", handler, { once: true });
      window.addEventListener("touchend", handler, { once: true });
      window.addEventListener("keydown", handler, { once: true });

    };
    attachResumeHandlers();

    // Play the video and fire the event when ready
    video.addEventListener("canplaythrough", () => {
      //   "[VideoTexture] canplaythrough. readyState:",
      //   video.readyState
      // );
      app.fire(this.playEvent, this.videoTexture);
      video
        .play()
        .then(() => {

        })
        .catch((e) => {
          console.warn("[VideoTexture] video.play() blocked:", e);
        });

      try {
        const context = getAudioContext();
        if (context && !this._audioConnected) {
          // Build spatial chain: MediaElementSource -> Panner -> Gain -> Destination
          const source = context.createMediaElementSource(video);
          const panner = context.createPanner();
          const gain = context.createGain();

          // Configure panner to mirror current sound component settings
          panner.panningModel = "HRTF";
          panner.distanceModel = "inverse";
          panner.refDistance = 3.8;
          panner.rolloffFactor = 210;

          gain.gain.value = 1.0;

          source.connect(panner);
          panner.connect(gain);
          gain.connect(context.destination);

          this._sourceNode = source;
          this._pannerNode = panner;
          this._gainNode = gain;
          //   "[VideoTexture] Connected MediaElementSource -> Panner -> Gain -> Destination"
          // );

          const startAudio = () => {
            if (context.state === "suspended") context.resume();
            const wasMuted = video.muted;
            video.muted = false;
            //   "[VideoTexture] startAudio: unmuted video (was:",
            //   wasMuted,
            //   ") volume:",
          };

          if (context.state === "running") {
            startAudio();
          } else {
            attachResumeHandlers();
          }

          this._audioConnected = true;
          this._cleanupAudio = () => {
            try {
              source.disconnect();
            } catch {}
            try {
              panner.disconnect();
            } catch {}
            try {
              gain.disconnect();
            } catch {}
          };
        }
      } catch (e) {
        console.warn("Video audio hookup failed:", e);
      }
      // Enforce playback gate immediately after readiness
      this._updatePlaybackGate();
    });

    app.on("pointerlock:changed", (isLocked) => {
      this._isPointerLocked = !!isLocked;
      this._updatePlaybackGate();
    });

    // video.addEventListener("play", () => {
    //     "[VideoTexture] video event: play, currentTime:",
    //     video.currentTime
    //   );
    // });
    // video.addEventListener("pause", () => {
    //     "[VideoTexture] video event: pause, currentTime:",
    //     video.currentTime
    //   );
    // });
    video.addEventListener("error", (e) => {
      console.warn("[VideoTexture] video error:", video.error || e);
    });

    video.src = this.videoAsset ? this.videoAsset.getFileUrl() : this.videoUrl;
    video.load();

    this.on("destroy", () => {
      if (this._cleanupAudio) this._cleanupAudio();
      this.videoTexture.destroy();
      video.remove();
    });
  }

  update(dt) {
    this.videoTexture.upload();

    // Throttled player lookup if not yet cached
    if (!this._playerEntity) {
      this._timeSinceLastPlayerLookup += dt;
      if (this._timeSinceLastPlayerLookup >= 0.5) {
        this._timeSinceLastPlayerLookup = 0;
        // findByName returns GraphNode; cast to Entity for TS consumers
        /** @type {import('playcanvas').Entity|null} */
        const found = /** @type {any} */ (this.app.root.findByName("Player"));
        if (found && found.enabled) this._playerEntity = found;
      }
    }

    // If we have a player, update distance gate with hysteresis and gate playback
    if (this._playerEntity) {
      const playSq = this._getPlayDistanceSq();
      const pauseSq = this._getPauseDistanceSq();

      const a = this.entity.getPosition();
      const b = this._playerEntity.getPosition();
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dz = a.z - b.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (this._isWithinDistance) {
        // Only flip to false if beyond pause threshold
        if (distSq > pauseSq) {
          this._isWithinDistance = false;
          this._updatePlaybackGate();
        }
      } else {
        // Only flip to true if within play threshold
        if (distSq < playSq) {
          this._isWithinDistance = true;
          this._updatePlaybackGate();
        }
      }
    }
    // If using our own panner, keep it synced with entity position
    if (this._pannerNode) {
      const pos = this.entity.getPosition();
      if ("positionX" in this._pannerNode) {
        this._pannerNode.positionX.value = pos.x;
        this._pannerNode.positionY.value = pos.y;
        this._pannerNode.positionZ.value = pos.z;
      } else if (this._pannerNode.setPosition) {
        this._pannerNode.setPosition(pos.x, pos.y, pos.z);
      }
    }
  }

  /** Compute squared play threshold with hysteresis */
  _getPlayDistanceSq() {
    if (this._playDistanceSq == null) {
      const t = Math.max(0, this._minDistance - this._distanceHysteresis);
      this._playDistanceSq = t * t;
    }
    return this._playDistanceSq;
  }

  /** Compute squared pause threshold with hysteresis */
  _getPauseDistanceSq() {
    if (this._pauseDistanceSq == null) {
      const t = this._minDistance + this._distanceHysteresis;
      this._pauseDistanceSq = t * t;
    }
    return this._pauseDistanceSq;
  }

  /** Centralized playback gate combining pointer lock and distance */
  _updatePlaybackGate() {
    const video = this.video;
    if (!video) return;

    const shouldPlay = this._isPointerLocked && this._isWithinDistance;
    if (shouldPlay) {
      if (video.paused) {
        video.play().catch(() => {});
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }
}
