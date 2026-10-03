import { ASSET_PATHS } from '../config/assets';

class SoundManager {
  private bgWaiting: HTMLAudioElement | null = null;
  private bgPlaying: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private hasUserInteracted: boolean = false;
  private volume: number = 0.5;

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      try {
        this.bgWaiting = new Audio(ASSET_PATHS.sounds.bgWaiting);
        this.bgWaiting.loop = true;
        this.bgWaiting.volume = 0.35 * this.volume;

        this.bgPlaying = new Audio(ASSET_PATHS.sounds.bgPlaying);
        this.bgPlaying.loop = true;
        this.bgPlaying.volume = 0.25 * this.volume;
      } catch (err) {
        console.warn('Audio initialization warning:', err);
      }
    }
  }

  public registerUserInteraction() {
    if (!this.hasUserInteracted) {
      this.hasUserInteracted = true;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgWaiting) this.bgWaiting.muted = muted;
    if (this.bgPlaying) this.bgPlaying.muted = muted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.bgWaiting) this.bgWaiting.volume = 0.35 * this.volume;
    if (this.bgPlaying) this.bgPlaying.volume = 0.45 * this.volume;
  }

  public playBgm(mode: 'waiting' | 'playing' | 'stop') {
    if (!this.hasUserInteracted) return;

    if (mode === 'waiting') {
      if (this.bgPlaying) {
        this.bgPlaying.pause();
        this.bgPlaying.currentTime = 0;
      }
      if (this.bgWaiting && !this.isMuted) {
        this.safePlay(this.bgWaiting);
      }
    } else if (mode === 'playing') {
      if (this.bgWaiting) {
        this.bgWaiting.pause();
        this.bgWaiting.currentTime = 0;
      }
      if (this.bgPlaying && !this.isMuted) {
        this.safePlay(this.bgPlaying);
      }
    } else {
      if (this.bgWaiting) this.bgWaiting.pause();
      if (this.bgPlaying) this.bgPlaying.pause();
    }
  }

  public pauseBgm() {
    if (this.bgPlaying) this.bgPlaying.pause();
    if (this.bgWaiting) this.bgWaiting.pause();
  }

  public resumeBgm(mode: 'waiting' | 'playing') {
    if (mode === 'playing' && this.bgPlaying && !this.isMuted) {
      this.safePlay(this.bgPlaying);
    } else if (mode === 'waiting' && this.bgWaiting && !this.isMuted) {
      this.safePlay(this.bgWaiting);
    }
  }

  public playSfx(type: 'point' | 'bonus' | 'damage') {
    if (this.isMuted || !this.hasUserInteracted) return;

    try {
      let soundPath: string = ASSET_PATHS.sounds.point;
      let vol = 0.5 * this.volume;

      if (type === 'bonus') {
        soundPath = ASSET_PATHS.sounds.point2;
        vol = 0.65 * this.volume;
      } else if (type === 'damage') {
        soundPath = ASSET_PATHS.sounds.damage;
        vol = 0.6 * this.volume;
      }

      const sfx = new Audio(soundPath);
      sfx.volume = vol;
      this.safePlay(sfx);
    } catch {
      // Audio playback errors should not block gameplay
    }
  }

  private safePlay(audio: HTMLAudioElement) {
    const promise = audio.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        // Autoplay policy or interrupted by pause
      });
    }
  }
}

export const soundManager = new SoundManager();
