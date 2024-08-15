document.addEventListener("DOMContentLoaded", function () {
   const { jsPDF } = window.jspdf;
   let signaturePad;
   // Car prices and models
   const carPrices = {
      Alphard: 2500000,
      Fortuner: 1500000,
      Pajero: 1500000,
      "Innova zenix": 800000,
      "Innova reborn": 600000,
      Xpander: 550000,
      Terios: 500000,
      Rush: 500000,
      "Avanza Matic": 450000,
      "Avanza Manual": 350000,
      "Xenia Manual": 350000,
   };
   // DOM Elements
   const elements = {
      loginForm: document.getElementById("loginForm"),
      loginButton: document.getElementById("loginButton"),
      invoiceForm: document.getElementById("invoiceForm"),
      createInvoiceButton: document.getElementById("createInvoiceButton"),
      loginPage: document.getElementById("loginPage"),
      invoicePage: document.getElementById("invoicePage"),
      invoicePreview: document.getElementById("invoice"),
      actionButtons: document.getElementById("actionButtons"),
      shareWhatsAppButton: document.getElementById("shareWhatsApp"),
      exportPDFButton: document.getElementById("exportPDF"),
      addCarButton: document.getElementById("addCar"),
      carContainer: document.getElementById("carContainer"),
      nameInput: document.getElementById("name"),
      recipientPhoneInput: document.getElementById("recipientPhone"),
      rentalDurationInput: document.getElementById("rentalDuration"),
      signaturePadCanvas: document.getElementById("signature-pad"),
      clearSignatureButton: document.getElementById("clear-signature"),
      signatureUploadInput: document.getElementById("signature-upload"),
      signaturePreview: document.getElementById("signature-preview"),
      errorMessage: document.getElementById("error-message"),
      totalCostInput: document.getElementById("totalCost"),
      rentalDateInput: document.getElementById("rentalDate"),
   };
   // Initialize SignaturePad
   signaturePad = new SignaturePad(elements.signaturePadCanvas);
   // Event Listeners
   elements.loginButton.addEventListener("click", handleLogin);
   elements.createInvoiceButton.addEventListener(
      "click",
      handleInvoiceCreation
   );
   elements.addCarButton.addEventListener("click", addCarEntry);
   elements.carContainer.addEventListener("change", handleCarContainerChange);
   elements.rentalDurationInput.addEventListener("input", updatePrice);
   elements.nameInput.addEventListener("input", validateName);
   elements.recipientPhoneInput.addEventListener("input", validatePhone);
   elements.clearSignatureButton.addEventListener("click", () =>
      signaturePad.clear()
   );
   elements.signatureUploadInput.addEventListener(
      "change",
      handleSignatureUpload
   );
   elements.shareWhatsAppButton.addEventListener("click", shareViaWhatsApp);
   elements.exportPDFButton.addEventListener("click", exportToPDF);
   // Add initial car entry
   addCarEntry();
   // Functions
   function handleLogin(event) {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const hashedPassword = CryptoJS.SHA256(password).toString();
      const validUsers = {
         aldo: "c469aed97adf5d2bd3d2c0900e5b66ce114bcdd425f60bee72d78385048cf1bb",
         dias: "1ae09c800f9ba5c71fec37a91be3c23a65dfb666d1386c3dc1ab23415cdf51b4",
      };
      if (validUsers[username] && validUsers[username] === hashedPassword) {
         elements.loginPage.classList.add("hidden");
         elements.invoicePage.classList.remove("hidden");
         displayGreeting(username);
      } else {
         displayError("Login gagal. Username atau password salah.");
      }
   }

   function displayGreeting(username) {
      const greeting = username === "aldo" ? "Hallo, Geraldo" : "Hallo, Dias";
      const greetingContainer = document.createElement("div");
      greetingContainer.className =
         "max-w-4xl mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 p-8 rounded-3xl shadow-lg mb-12 transform transition-all duration-300 hover:shadow-xl";
      const greetingContent = `
    
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-3xl font-bold text-white mb-2">${greeting}</h2>
					<p class="text-blue-100 text-lg">Selamat datang di sistem invoice Damarsari Rent Car.</p>
				</div>
				<div class="hidden md:block">
					<i class="fas fa-car-side text-white text-5xl opacity-50"></i>
				</div>
			</div>
  `;
      greetingContainer.innerHTML = greetingContent;
      // Insert the new greeting container at the beginning of invoicePage
      elements.invoicePage.insertBefore(
         greetingContainer,
         elements.invoicePage.firstChild
      );
      // Add a smooth scroll to the form
      setTimeout(() => {
         const invoiceForm = document.getElementById("invoiceForm");
         invoiceForm.scrollIntoView({
            behavior: "smooth",
            block: "start",
         });
      }, 300);
   }
   async function handleInvoiceCreation(event) {
      event.preventDefault();
      if (validateForm()) {
         await generateInvoice();
      }
   }

   function handleCarContainerChange(event) {
      if (
         event.target.classList.contains("carModel") ||
         event.target.classList.contains("platNomor") ||
         event.target.classList.contains("carColor") ||
         event.target.classList.contains("withDriver")
      ) {
         updatePrice();
      }
   }

   function handleSignatureUpload(event) {
      const file = event.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
               const canvas = document.createElement("canvas");
               canvas.width = img.width;
               canvas.height = img.height;
               const ctx = canvas.getContext("2d");
               ctx.drawImage(img, 0, 0);
               signaturePad.fromDataURL(canvas.toDataURL());
               elements.signaturePreview.style.backgroundImage = `url(${canvas.toDataURL()})`;
            };
            img.src = e.target.result;
         };
         reader.readAsDataURL(file);
      }
   }

   function validateForm() {
      const name = elements.nameInput.value;
      const rentalDate = elements.rentalDateInput.value;
      const rentalDuration = elements.rentalDurationInput.value;
      const recipientPhoneValid = validatePhone();
      let allCarsValid = true;
      document.querySelectorAll(".car-entry").forEach((entry) => {
         const carModel = entry.querySelector(".carModel").value;
         const platNomor = entry.querySelector(".platNomor").value;
         const carColor = entry.querySelector(".carColor").value;
         if (!carModel || !platNomor || !carColor) {
            allCarsValid = false;
         }
      });
      if (
         name &&
         rentalDate &&
         rentalDuration &&
         recipientPhoneValid &&
         allCarsValid
      ) {
         clearError();
         return true;
      } else {
         displayError(
            "Mohon lengkapi semua input sebelum mengirimkan invoice."
         );
         return false;
      }
   }

   function updatePrice() {
      let totalCost = 0;
      const rentalDuration = parseInt(elements.rentalDurationInput.value) || 0;
      document.querySelectorAll(".car-entry").forEach((entry) => {
         const carModel = entry.querySelector(".carModel").value;
         const withDriver = entry.querySelector(".withDriver").checked;
         if (carModel && rentalDuration) {
            let pricePerDay = carPrices[carModel];
            if (withDriver) {
               pricePerDay += 200000; // Add driver cost
            }
            totalCost += pricePerDay * rentalDuration;
            entry
               .querySelectorAll(".additional-cost-entry")
               .forEach((costEntry) => {
                  const costAmount =
                     parseFloat(
                        costEntry.querySelector(".cost-amount").value
                     ) || 0;
                  totalCost += costAmount;
               });
         }
      });
      elements.totalCostInput.value = `Rp${totalCost.toLocaleString()}`;
   }
   async function generateInvoice() {
      const invoiceData = collectInvoiceData();
      invoiceData.signatureDataUrl = await optimizeSignature(
         invoiceData.signatureDataUrl
      );
      const invoiceContent = createInvoiceContent(invoiceData);
      elements.invoicePreview.innerHTML = invoiceContent;
      elements.invoicePreview.classList.remove("hidden");
      elements.actionButtons.classList.remove("hidden");
   }

   function collectInvoiceData() {
      return {
         name: elements.nameInput.value,
         rentalDate: formatDate(elements.rentalDateInput.value),
         rentalDuration: elements.rentalDurationInput.value,
         totalCost: elements.totalCostInput.value,
         recipientPhone: elements.recipientPhoneInput.value,
         carDetails: getCarDetails(),
         signatureDataUrl: signaturePad.toDataURL(),
         invoiceNumber: generateInvoiceNumber(),
      };
   }

   function optimizeSignature(signatureDataUrl) {
      return new Promise((resolve) => {
         const img = new Image();
         img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = 400;
            canvas.height = 200;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const ratio = Math.min(
               canvas.width / img.width,
               canvas.height / img.height
            );
            const newWidth = img.width * ratio;
            const newHeight = img.height * ratio;
            const x = (canvas.width - newWidth) / 2;
            const y = (canvas.height - newHeight) / 2;
            ctx.drawImage(img, x, y, newWidth, newHeight);
            resolve(canvas.toDataURL());
         };
         img.src = signatureDataUrl;
      });
   }

   function getCarDetails() {
      return Array.from(document.querySelectorAll(".car-entry")).map(
         (entry) => ({
            carModel: entry.querySelector(".carModel").value,
            platNomor: entry.querySelector(".platNomor").value,
            carColor: entry.querySelector(".carColor").value,
            withDriver: entry.querySelector(".withDriver").checked,
            pricePerDay:
               carPrices[entry.querySelector(".carModel").value] +
               (entry.querySelector(".withDriver").checked ? 200000 : 0),
            additionalCosts: Array.from(
               entry.querySelectorAll(".additional-cost-entry")
            ).map((costEntry) => ({
               description: costEntry.querySelector(".cost-description").value,
               amount:
                  parseFloat(costEntry.querySelector(".cost-amount").value) ||
                  0,
            })),
         })
      );
   }

   function createInvoiceContent(data) {
      return `
    
			<div class="flex flex-col min-h-[297mm] w-[210mm] bg-white p-10 font-sans shadow-xl rounded-lg">
				<header class="flex justify-between items-center mb-10">
					<div class="flex items-center space-x-4">
						<img src="damarsari.png" alt="Damarsari Rent Car Logo" class="w-24 h-auto">
							<div>
								<h2 class="text-3xl font-extrabold text-gray-900">Damarsari Rent Car</h2>
								<p class="text-sm text-gray-500">Solusi Rental Mobil Terpercaya</p>
							</div>
						</div>
						<div class="text-right">
							<h3 class="text-5xl font-bold text-blue-700 tracking-wide">INVOICE</h3>
							<p class="text-gray-600 mt-4">No. Invoice: 
								<span class="font-semibold">${data.invoiceNumber}</span>
							</p>
							<p class="text-gray-600">Tanggal: 
								<span class="font-semibold">${new Date().toLocaleDateString()}</span>
							</p>
						</div>
					</header>
					<section class="flex justify-between mb-12">
						<div>
							<h4 class="text-lg font-semibold text-blue-700 mb-2">Dari:</h4>
							<p class="text-gray-800 font-medium">Damarsari Rent Car</p>
							<p class="text-gray-600">Jl. Damarsari II 39-53, Jakarta Selatan</p>
							<p class="text-gray-600">Telp: +62 877-8833-2232</p>
						</div>
						<div class="text-right">
							<h4 class="text-lg font-semibold text-blue-700 mb-2">Kepada:</h4>
							<p class="text-gray-800 font-medium">${data.name}</p>
							<p class="text-gray-600">Nomor Telepon: ${data.recipientPhone}</p>
						</div>
					</section>
					<div class="mb-8">
						<table class="w-full border-collapse">
							<thead>
								<tr class="bg-blue-50">
									<th class="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-700">Model Mobil</th>
									<th class="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-700">Plat Nomor</th>
									<th class="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-700">Warna</th>
									<th class="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-700">Harga Sewa/Hari</th>
									<th class="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-700">Biaya Supir/Hari</th>
									<th class="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-700">Durasi</th>
									<th class="border border-blue-200 px-4 py-3 text-right text-sm font-semibold text-blue-700">Subtotal</th>
								</tr>
							</thead>
							<tbody>
                    ${data.carDetails
                       .map(
                          (car, index) => `
                    
								<tr class="${index % 2 === 0 ? "bg-white" : "bg-gray-50"}">
									<td class="border border-gray-200 px-4 py-3 text-gray-800 text-left">${
                              car.carModel
                           }</td>
									<td class="border border-gray-200 px-4 py-3 text-gray-800 text-left">${
                              car.platNomor
                           }</td>
									<td class="border border-gray-200 px-4 py-3 text-gray-800 text-left">${
                              car.carColor
                           }</td>
									<td class="border border-gray-200 px-4 py-3 text-gray-800 text-right">Rp${(
                              car.pricePerDay - (car.withDriver ? 200000 : 0)
                           ).toLocaleString()}</td>
									<td class="border border-gray-200 px-4 py-3 text-gray-800 text-right">${
                              car.withDriver ? "Rp200,000" : "-"
                           }</td>
									<td class="border border-gray-200 px-4 py-3 text-gray-800 text-center">${
                              data.rentalDuration
                           } hari</td>
									<td class="border border-gray-200 px-4 py-3 text-gray-800 text-right font-semibold">Rp${(
                              car.pricePerDay * data.rentalDuration
                           ).toLocaleString()}</td>
								</tr>
                    ${
                       car.additionalCosts.length > 0
                          ? `
                    
								<tr class="${index % 2 === 0 ? "bg-white" : "bg-gray-50"}">
									<td colspan="7" class="border border-gray-200 px-4 py-3">
										<div class="text-sm text-gray-800">
											<strong class="text-blue-700">Biaya Tambahan :</strong>
											<ul class="list-disc list-inside mt-2 space-y-1">
                                    ${car.additionalCosts
                                       .map(
                                          (cost) => `
                                    
												<li class="flex justify-between">
													<span>${cost.description}</span>
													<span class="font-medium">Rp${cost.amount.toLocaleString()}</span>
												</li>
                                    `
                                       )
                                       .join("")}
                                
											</ul>
										</div>
									</td>
								</tr>`
                          : ""
                    }
                    `
                       )
                       .join("")}
                
							</tbody>
							<tfoot>
								<tr class="bg-blue-50">
									<td colspan="6" class="border border-blue-200 px-4 py-3 text-right font-bold text-blue-700">Grand Total</td>
									<td class="border border-blue-200 px-4 py-3 text-right font-bold text-blue-700">Rp${data.totalCost.toLocaleString()}</td>
								</tr>
							</tfoot>
						</table>
					</div>
					<div class="flex justify-end items-end mt-auto">
						<div class="text-right">
							<img src="${
                        data.signatureDataUrl
                     }" alt="Tanda Tangan" class="signature-image inline-block mb-4" style="width: 200px; height: 100px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 4px;" />
							<p class="text-sm text-gray-600">Damarsari Rent Car</p>
						</div>
					</div>
					<footer class="mt-12 pt-6 border-t border-gray-300 text-sm text-gray-500 text-center">
						<p>Damarsari Rent Car | Jl. Damarsari II 39-53, Jakarta Selatan | Telp: +62 877-8833-2232</p>
						<p class="mt-2">Terima kasih atas kepercayaan Anda. Selamat menikmati perjalanan!</p>
					</footer>
				</div>
    `;
   }

   function shareViaWhatsApp() {
      const invoiceData = collectInvoiceData();
      const message = createWhatsAppMessage(invoiceData);
      if (invoiceData.recipientPhone === "-") {
         // If no phone number, open WhatsApp with just the message
         const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
            message
         )}`;
         window.open(whatsappUrl, "_blank");
      } else {
         // If there's a phone number, proceed as before
         const formattedRecipientPhone = invoiceData.recipientPhone.replace(
            /^0/,
            "62"
         );
         const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedRecipientPhone}&text=${encodeURIComponent(
            message
         )}`;
         window.open(whatsappUrl, "_blank");
      }
   }

   function createWhatsAppMessage(data) {
      const carDetailsMessage = data.carDetails
         .map(
            (car, index) => `
         *Mobil ${index + 1}:*
         Model Mobil : *${car.carModel}*
         Plat Nomor : *${car.platNomor}*
         Warna : *${car.carColor}*
         Dengan Supir : *${car.withDriver ? "Ya" : "Tidak"}*
         Harga Sewa per Hari : *Rp* *${car.pricePerDay.toLocaleString()}*
         Subtotal : *Rp* *${(
            car.pricePerDay * data.rentalDuration
         ).toLocaleString()}*
         ${
            car.additionalCosts.length > 0
               ? `
         Biaya Tambahan:
         ${car.additionalCosts
            .map(
               (cost) =>
                  `- ${
                     cost.description
                  }: *Rp* *${cost.amount.toLocaleString()}*`
            )
            .join("\n")}
         Total Biaya Tambahan: *Rp* *${car.additionalCosts
            .reduce((sum, cost) => sum + cost.amount, 0)
            .toLocaleString()}*
         `
               : ""
         }
         Total untuk Mobil ${index + 1}: *Rp* *${(
               car.pricePerDay * data.rentalDuration +
               car.additionalCosts.reduce((sum, cost) => sum + cost.amount, 0)
            ).toLocaleString()}*
         `
         )
         .join("\n\n");
      let phoneInfo =
         data.recipientPhone === "-"
            ? "Nomor Telepon : *Tidak tersedia*"
            : `Nomor Telepon : *${data.recipientPhone}*`;
      return `*Damarsari Rent Car*

         ========================
         *e-INVOICE RENTAL MOBIL*
         ========================

         Nama Pelanggan : *${data.name}*

         ${phoneInfo}

         Tanggal Rental : *${data.rentalDate}*

         Durasi Rental : *${data.rentalDuration}* *hari*

         ========================
         ${carDetailsMessage}
         ========================
         Total Biaya : *${data.totalCost}*
         ========================

         Terima kasih telah menggunakan layanan kami.
         Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami.

         Hubungi kami di: +62 877-8833-2232

         Best regards,
         *Damarsari Rent Car*`;
   }

   function exportToPDF() {
      const scale = 4;
      html2canvas(elements.invoicePreview, {
         scale: scale,
         useCORS: true,
         logging: true,
         letterRendering: 1,
         allowTaint: false,
      }).then((canvas) => {
         const imgData = canvas.toDataURL("image/jpeg", 1.0);
         const pdf = new jsPDF("p", "mm", "a4");
         const pdfWidth = pdf.internal.pageSize.getWidth();
         const pdfHeight = pdf.internal.pageSize.getHeight();
         const imgWidth = canvas.width / scale;
         const imgHeight = canvas.height / scale;
         const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
         pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
         const safeName = elements.nameInput.value
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase();
         const invoiceNumber = document.querySelector(
            "#invoice .font-semibold"
         ).textContent;
         pdf.save(
            `invoice_damarsari_rent_car_${safeName}_${invoiceNumber}.pdf`
         );
      });
   }

   function addCarEntry() {
      const carEntryCount = elements.carContainer.children.length;
      const newCarEntry = createCarEntryElement(carEntryCount);
      elements.carContainer.appendChild(newCarEntry);
      updateRemoveButtonVisibility();
   }

   function updateRemoveButtonVisibility() {
      const carEntries = elements.carContainer.querySelectorAll(".car-entry");
      carEntries.forEach((entry, i) => {
         const btn = entry.querySelector(".remove-car-btn");
         if (carEntries.length === 1) {
            btn.style.display = "none";
         } else {
            btn.style.display = "block";
         }
      });
   }

   function createCarEntryElement(index) {
      const div = document.createElement("div");
      div.className =
         "car-entry space-y-4 md:space-y-6 bg-white p-4 md:p-6 rounded-lg shadow-md mb-6 md:mb-8 relative";
      div.innerHTML = `
    
				<button type="button" class="remove-car-btn absolute top-2 right-2 text-red-500 hover:text-red-700 focus:outline-none transition-colors duration-300">
					<i class="fas fa-times text-xl"></i>
				</button>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
					<div class="relative">
						<label
          for="carModel${index}"
          class="block text-sm md:text-base text-secondary mb-1"
        >Model Mobil</label>
						<select
          id="carModel${index}"
          class="carModel w-full p-3 md:p-4 text-base md:text-lg bg-light border-2 border-secondary rounded-lg focus:border-primary focus:outline-none transition-all duration-300 ease-in-out"
          required
        >
							<option value="" disabled selected>Pilih model mobil</option>
          ${Object.entries(carPrices)
             .map(
                ([model, price]) =>
                   `
							<option value="${model}">${model} - Rp. ${price.toLocaleString()}</option>`
             )
             .join("")}
        
						</select>
					</div>
					<div class="relative">
						<label
          for="platNomor${index}"
          class="block text-sm md:text-base text-secondary mb-1"
        >Plat Nomor</label>
						<input
          type="text"
          id="platNomor${index}"
          class="platNomor w-full p-3 md:p-4 text-base md:text-lg bg-light border-2 border-secondary rounded-lg focus:border-primary focus:outline-none transition-all duration-300 ease-in-out"
          required
        />
					</div>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
					<div class="relative">
						<label
          for="carColor${index}"
          class="block text-sm md:text-base text-secondary mb-1"
        >Warna Mobil</label>
						<input
          type="text"
          id="carColor${index}"
          class="carColor w-full p-3 md:p-4 text-base md:text-lg bg-light border-2 border-secondary rounded-lg focus:border-primary focus:outline-none transition-all duration-300 ease-in-out"
          required
        />
					</div>
					<div class="flex items-center">
						<input
          type="checkbox"
          id="withDriver${index}"
          class="withDriver w-5 h-5 md:w-6 md:h-6 text-primary bg-light border-2 border-secondary rounded focus:ring-primary"
        />
						<label
          for="withDriver${index}"
          class="ml-2 text-sm md:text-base text-secondary"
        >Dengan Supir (+Rp. 200,000/hari)</label>
					</div>
				</div>
				<div class="additional-costs mt-4 md:mt-6">
					<h4 class="text-base md:text-lg font-semibold text-primary mb-2 md:mb-4">Biaya Tambahan</h4>
					<div class="additional-cost-entries space-y-3 md:space-y-4"></div>
					<button type="button" class="add-cost-btn mt-3 md:mt-4 px-4 md:px-5 py-2 md:py-3 text-sm md:text-base bg-primary text-white rounded-lg hover:bg-dark transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
						<i class="fas fa-plus mr-2"></i>Tambah Biaya
      
					</button>
				</div>
  `;
      const addCostBtn = div.querySelector(".add-cost-btn");
      addCostBtn.addEventListener("click", () => addAdditionalCostEntry(div));
      const removeCarBtn = div.querySelector(".remove-car-btn");
      removeCarBtn.addEventListener("click", () => {
         if (elements.carContainer.children.length > 1) {
            div.remove();
            updatePrice();
         }
      });

      function updateRemoveButtonVisibility() {
         const carEntries =
            elements.carContainer.querySelectorAll(".car-entry");
         carEntries.forEach((entry, i) => {
            const btn = entry.querySelector(".remove-car-btn");
            if (carEntries.length === 1) {
               btn.style.display = "none";
            } else {
               btn.style.display = "block";
            }
         });
      }
      updateRemoveButtonVisibility();
      const observer = new MutationObserver(updateRemoveButtonVisibility);
      observer.observe(elements.carContainer, {
         childList: true,
      });
      return div;
   }

   function addAdditionalCostEntry(carEntry) {
      const costEntries = carEntry.querySelector(".additional-cost-entries");
      const costIndex = costEntries.children.length;
      const costEntry = document.createElement("div");
      costEntry.className =
         "additional-cost-entry grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 relative mb-2 sm:mb-4";
      costEntry.innerHTML = `
    
				<div class="relative">
					<input 
        type="text" 
        class="cost-description peer w-full p-2 sm:p-4 pt-4 sm:pt-6 text-xs sm:text-sm bg-light border-2 border-secondary rounded-lg focus:border-primary focus:outline-none transition-all duration-300 ease-in-out" 
        placeholder=" " 
        required
      >
						<label 
        class="absolute left-2 sm:left-4 top-1 sm:top-2 text-xs sm:text-sm text-secondary transition-all duration-300 transform -translate-y-2 scale-75 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2 peer-focus:text-primary"
      >Keterangan biaya</label>
					</div>
					<div class="relative">
						<input 
        type="number" 
        class="cost-amount peer w-full p-2 sm:p-4 pt-4 sm:pt-6 text-xs sm:text-sm bg-light border-2 border-secondary rounded-lg focus:border-primary focus:outline-none transition-all duration-300 ease-in-out" 
        placeholder=" " 
        required
      >
							<label 
        class="absolute left-2 sm:left-4 top-1 sm:top-2 text-xs sm:text-sm text-secondary transition-all duration-300 transform -translate-y-2 scale-75 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2 peer-focus:text-primary"
      >Jumlah biaya</label>
						</div>
						<button 
      type="button" 
      class="remove-cost-btn absolute top-1 sm:top-2 right-1 sm:right-2 text-red-500 hover:text-red-700 focus:outline-none"
    >
							<i class="fas fa-times text-xs sm:text-sm"></i>
						</button>
  `;
      const removeCostBtn = costEntry.querySelector(".remove-cost-btn");
      removeCostBtn.addEventListener("click", () => {
         costEntry.remove();
         updatePrice();
      });
      costEntries.appendChild(costEntry);
   }
   // Utility functions
   function createElementWithClass(tag, className, textContent) {
      const element = document.createElement(tag);
      element.className = className;
      element.textContent = textContent;
      return element;
   }

   function displayError(message) {
      elements.errorMessage.textContent = message;
      elements.errorMessage.classList.remove("hidden");
   }

   function clearError() {
      elements.errorMessage.classList.add("hidden");
   }

   function validateName() {
      const name = elements.nameInput.value;
      if (!name) {
         clearError();
      } else if (!/^[A-Za-z\s]+$/.test(name)) {
         displayError("Nama hanya boleh mengandung huruf.");
      } else {
         clearError();
      }
   }

   function validatePhone() {
      const recipientPhone = elements.recipientPhoneInput.value;
      if (!recipientPhone) {
         clearError();
         return false;
      } else if (recipientPhone === "-") {
         clearError();
         return true;
      } else if (
         recipientPhone.match(/^0|^\+62/) &&
         recipientPhone.match(/^\d{9,14}$/)
      ) {
         clearError();
         return true;
      } else {
         displayError(
            "Nomor telepon harus dimulai dengan '0' atau '+62' dan memiliki panjang antara 9 hingga 14 digit, atau gunakan '-' jika tidak ada nomor telepon."
         );
         return false;
      }
   }

   function formatDate(date) {
      const options = {
         weekday: "long",
         year: "numeric",
         month: "long",
         day: "numeric",
      };
      const [year, month, day] = date.split("-");
      const formattedDate = new Date(year, month - 1, day).toLocaleDateString(
         "id-ID",
         options
      );
      return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
   }

   function generateInvoiceNumber() {
      const now = new Date();
      return `${now
         .getFullYear()
         .toString()
         .slice(
            -2
         )}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now.getSeconds().toString().padStart(2, "0")}`;
   }
});
