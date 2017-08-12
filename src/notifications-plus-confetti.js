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
			this.addConfetti();
		}));

		this.disposables.add(atom.packages.onDidActivatePackage(pkg => {
			if (pkg.name === "notifications-plus") {
				this.addConfetti();
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
				confetto.dataset.left = (i < this.numberOfConfetti / 2 ? "1" : "");
				this.confetti.push(confetto);
				this.notificationCount.appendChild(confetto);
			}
			this.notificationCountNumber.addEventListener("animationstart", this.animationstart, false);
			this.notificationCountNumber.addEventListener("animationend", this.animationend, false);
		} else {
			setTimeout(this.addConfetti, 1000);
		}
	},

	animationstart(e) {
		if (e.animationName === "new-notification") {
			this.confetti.forEach(confetto => {
				const moveH = Math.random() * 90 + 10;
				const moveV = Math.random() * 30 - 15;
				const rotate = Math.random() * 720 - 360;

				if (confetto.dataset.left) {
					confetto.style.right = "100%";
					confetto.style.transform = `translate3d(-${moveH}px, ${moveV}px, 0) rotate(${rotate}deg)`;
				} else {
					confetto.style.left = "100%";
					confetto.style.transform = `translate3d(${moveH}px, ${moveV}px, 0) rotate(${rotate}deg)`;
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
