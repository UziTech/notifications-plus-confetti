"use babel";

import { CompositeDisposable } from "atom";

let disposables = new CompositeDisposable(); // TODO: init on activate
let confetti = [];
let notificationCount = document.querySelector(".notifications-count");
let notificationCountNumber = null;

export default {
	activate() {
		disposables.add(atom.packages.onDidActivatePackage((pkg) => {
			if (pkg.name === "notifications-plus") {
				this.addConfetti();
			}
		}));
		if (atom.packages.getActivePackage("notifications-plus")) {
			this.addConfetti();
		}
	},

	deactivate() {
		confetti.forEach(i => i.remove());
		confetti = [];
		if (notificationCountNumber) {
			notificationCountNumber.removeEventListener("animationstart", this.animationstart, false);
			notificationCountNumber.removeEventListener("animationend", this.animationend, false);
		}
		disposables.dispose();
	},

	addConfetti() {
		notificationCount = document.querySelector(".notifications-count");
		if (notificationCount) {
			const total = atom.config.get("notifications-plus-confetti.numberOfConfetti"); // TODO: reactive
			notificationCountNumber = notificationCount.querySelector("div");
			for (let i = 0; i < total; i++) {
				const confetto = document.createElement("i");
				confetto.dataset.left = (i < total / 2 ? "1" : "");
				confetti.push(confetto);
				notificationCount.appendChild(confetto);
			}
			notificationCountNumber.addEventListener("animationstart", this.animationstart, false);
			notificationCountNumber.addEventListener("animationend", this.animationend, false);
		} else {
			setTimeout(_ => { this.addConfetti(); }, 1000);
		}
	},

	animationstart(e) { // TODO: bind this
		if (e.animationName === "new-notification") {
			confetti.forEach(confetto => {
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

	animationend(e) { // TODO: bind this
		if (e.animationName === "new-notification") {
			confetti.forEach(confetto => {
				confetto.style = "";
			});
		}
	},
}
