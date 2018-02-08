"use babel";

import { CompositeDisposable } from "atom";

export default {
	config: {
		numberOfConfetti: {
			title: "Number of Confetti",
			type: "integer",
			default: 50,
			minimum: 0,
			maximum: 100,
			order: 0,
		},
		minDistance: {
			title: "Minimum Distance (px)",
			type: "integer",
			default: 10,
			minimum: 0,
			order: 1,
		},
		maxDistance: {
			title: "Maximum Distance (px)",
			type: "integer",
			default: 100,
			minimum: 0,
			order: 2,
		},
		sprayHeight: {
			title: "Spray Height (px)",
			type: "integer",
			default: 30,
			minimum: 0,
			order: 3,
		},
		maxSpin: {
			title: "Maximum Spin (deg)",
			type: "integer",
			default: 1800,
			minimum: 0,
			order: 4,
		},
		animationDuration: {
			title: "Animation Duration (ms)",
			type: "integer",
			default: 500,
			minimum: 0,
			order: 5,
		},
		animationEasing: {
			title: "Animation Easing",
			type: "string",
			default: "ease-out",
			enum: ["linear", "ease", "ease-in", "ease-out", "ease-in-out"],
			order: 6,
		},
		timingFunction: {
			title: "CSS Timing Function (e.g. 'cubic-bezier(x1, y1, x2, y2)')",
			description: "This overrides Animation Easing (https://developer.mozilla.org/en-US/docs/Web/CSS/single-transition-timing-function)",
			type: "string",
			default: "",
			order: 7,
		},
	},

	activate() {
		this.disposables = new CompositeDisposable();
		this.confetti = [];
		this.animations = [];
		this.notificationCountBadge = null;
		this.notificationCountNumber = null;
		this.timeout = null;
		this.animating = false;
		this.numberOfConfetti = this.config.numberOfConfetti.default;
		this.minDistance = this.config.minDistance.default;
		this.maxDistance = this.config.maxDistance.default;
		this.sprayHeight = this.config.sprayHeight.default;
		this.maxSpin = this.config.maxSpin.default;
		this.animationDuration = this.config.animationDuration.default;
		this.animationEasing = this.config.animationEasing.default;
		this.timingFunction = this.config.timingFunction.default;

		this.addConfetti = this.addConfetti.bind(this);
		this.removeConfetti = this.removeConfetti.bind(this);
		this.onAnimationStart = this.onAnimationStart.bind(this);
		this.onAnimationEnd = this.onAnimationEnd.bind(this);

		this.disposables.add(atom.config.observe("notifications-plus-confetti.numberOfConfetti", value => {
			this.numberOfConfetti = value;
			if (atom.packages.getActivePackage("notifications-plus")) {
				this.addConfetti();
			}
		}));

		this.disposables.add(atom.config.observe("notifications-plus-confetti.minDistance", value => {
			this.minDistance = value;
			if (this.minDistance > this.maxDistance) {
				[this.maxDistance, this.minDistance] = [this.minDistance, this.maxDistance];
			}
		}));

		this.disposables.add(atom.config.observe("notifications-plus-confetti.maxDistance", value => {
			this.maxDistance = value;
			if (this.maxDistance < this.minDistance) {
				[this.maxDistance, this.minDistance] = [this.minDistance, this.maxDistance];
			}
		}));

		this.disposables.add(atom.config.observe("notifications-plus-confetti.sprayHeight", value => {
			this.sprayHeight = value;
		}));

		this.disposables.add(atom.config.observe("notifications-plus-confetti.maxSpin", value => {
			this.maxSpin = value;
		}));

		this.disposables.add(atom.config.observe("notifications-plus-confetti.animationDuration", value => {
			this.animationDuration = value;
		}));

		this.disposables.add(atom.config.observe("notifications-plus-confetti.animationEasing", value => {
			this.animationEasing = value;
		}));

		this.disposables.add(atom.config.observe("notifications-plus-confetti.timingFunction", value => {
			this.timingFunction = value;
		}));

		this.disposables.add(atom.packages.onDidActivatePackage(pkg => {
			if (pkg.name === "notifications-plus") {
				this.addConfetti();
			}
		}));

		this.disposables.add(atom.packages.onDidDeactivatePackage(pkg => {
			if (pkg.name === "notifications-plus") {
				this.removeConfetti();
			}
		}));

		this.disposables.add(atom.notifications.onDidAddNotification(this.onAnimationStart));

		if (atom.packages.getActivePackage("notifications-plus")) {
			this.addConfetti();
		}
	},

	deactivate() {
		this.removeConfetti();
		this.disposables.dispose();
		this.disposables = null;
	},

	removeConfetti() {
		clearTimeout(this.timeout);
		this.confetti.forEach(i => i.remove());
		this.confetti = [];
		if (this.notificationCountNumber) {
			this.notificationCountBadge = null;
			this.notificationCountNumber = null;
		}
	},

	addConfetti() {
		this.removeConfetti();
		this.notificationCountBadge = document.querySelector(".notifications-count .notifications-count-badge");
		if (this.notificationCountBadge) {
			this.notificationCountNumber = document.querySelector(".notifications-count .notifications-count-number");
			for (let i = 0; i < this.numberOfConfetti; i++) {
				const confetto = document.createElement("i");
				confetto.classList.add("confetto");
				this.confetti.push(confetto);
				this.notificationCountBadge.appendChild(confetto);
			}
		} else if (atom.packages.getActivePackage("notifications-plus")) {
			this.timeout = setTimeout(this.addConfetti, 1000);
		}
	},

	onAnimationStart() {
		if (this.animating) {
			this.animations.forEach(animation => {
				animation.cancel();
			});
		} else if (this.notificationCountNumber) {
			this.animating = true;
			this.animations = this.confetti.map(confetto => {
				const left = Math.random() < 0.5;
				const moveX = (Math.random() * (this.maxDistance - this.minDistance)) + this.minDistance;
				const moveY = (Math.random() * this.sprayHeight) - (this.sprayHeight / 2);
				const rotate = (Math.random() * (this.maxSpin * 2)) - this.maxSpin;

				let transform;
				if (left) {
					confetto.style.right = "100%";
					transform = `translate3d(-${moveX}px, ${moveY}px, 0) rotate(${rotate}deg)`;
				} else {
					confetto.style.left = "100%";
					transform = `translate3d(${moveX}px, ${moveY}px, 0) rotate(${rotate}deg)`;
				}
				confetto.style.display = "block";

				return confetto.animate([
					{
						transform: "translate3d(0,0,0) rotate(0)",
						opacity: 1,
					},
					{
						transform: transform,
					},
				], {
					duration: this.animationDuration,
					easing: (this.timingFunction ? this.timingFunction : this.animationEasing),
				});
			});
			Promise.all(this.animations.map(a => a.finished)).then(
				() => { this.onAnimationEnd(false); },
				() => { this.onAnimationEnd(true); }
			);
		}
	},

	onAnimationEnd(canceled) {
		this.confetti.forEach(confetto => {
			confetto.style = "";
		});
		this.animating = false;
		if (canceled) {
			this.onAnimationStart();
		}
	},
};
