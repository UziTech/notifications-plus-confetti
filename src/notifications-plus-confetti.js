"use babel";

import { CompositeDisposable } from "atom";

export default {
	activate() {
		this.disposables = new CompositeDisposable();
		this.confetti = [];
		this.notificationCount = null;
		this.notificationCountNumber = null;
		this.numberOfConfetti = 0;

		this.addConfetti = this.addConfetti.bind(this);
		this.removeConfetti = this.removeConfetti.bind(this);
		this.animationstart = this.animationstart.bind(this);
		this.animationend = this.animationend.bind(this);

		this.disposables.add(atom.config.observe("notifications-plus-confetti.numberOfConfetti", value => {
			this.numberOfConfetti = value;
			if (atom.packages.getActivePackage("notifications-plus")) {
				this.addConfetti();
			}
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
		this.confetti.forEach(i => i.remove());
		this.confetti = [];
		if (this.notificationCountNumber) {
			this.notificationCountNumber.removeEventListener("animationstart", this.animationstart, false);
			this.notificationCountNumber.removeEventListener("animationend", this.animationend, false);
			this.notificationCount = null;
			this.notificationCountNumber = null;
		}
	},

	addConfetti() {
		this.removeConfetti();
		this.notificationCount = document.querySelector(".notifications-count");
		if (this.notificationCount) {
			this.notificationCountNumber = this.notificationCount.querySelector("div");
			for (let i = 0; i < this.numberOfConfetti; i++) {
				const confetto = document.createElement("i");
				this.confetti.push(confetto);
				this.notificationCount.appendChild(confetto);
			}
			this.notificationCountNumber.addEventListener("animationstart", this.animationstart, false);
			this.notificationCountNumber.addEventListener("animationend", this.animationend, false);
		} else if (atom.packages.getActivePackage("notifications-plus")) {
			setTimeout(this.addConfetti, 1000);
		}
	},

	animationstart(e) {
		if (e.animationName === "new-notification") {
			this.confetti.forEach(confetto => {
				const left = Math.random() < 0.5;
				const moveX = Math.random() * 90 + 10;
				const moveY = Math.random() * 30 - 15;
				const rotate = Math.random() * 720 - 360;

				if (left) {
					confetto.style.right = "100%";
					confetto.style.transform = `translate3d(-${moveX}px, ${moveY}px, 0) rotate(${rotate}deg)`;
				} else {
					confetto.style.left = "100%";
					confetto.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotate(${rotate}deg)`;
				}
				confetto.style.display = "block";
			});
		}
	},

	animationend(e) {
		if (e.animationName === "new-notification") {
			this.confetti.forEach(confetto => {
				confetto.style = "";
			});
		}
	},
};
