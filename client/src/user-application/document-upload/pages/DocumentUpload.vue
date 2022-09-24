<template>
  <Layout v-if="lastStep === 'document-upload'" :steps="true" :login="true">
    <div class="docUpload-content">
      <section id="docUpload">
        <div class="application-form" style="background-color: #fff">
          <div class="container">
            <div class="row justify-content-center">
              <div class="col-md-8 col-sm-12">
                <div v-if="!upload">
                  <h2 class="text-center uploadTitle">Last step!</h2>
                  <div
                    class="col-xs-10 col-xs-offset-1 text-center upload-subhead"
                  >
                    <br />
                    <p>
                      Upload photos of your US government issued ID with your
                      mobile device or uploading from your computer.
                    </p>
                    <br />
                    <br />
                  </div>
                  <div class="flex-column">
                    <h4 id="idTitle">Which form of ID are you uploading?</h4>
                    <div class="form-row justify-content-center">
                      <div class="form-group col-md-4" style="cursor: pointer;">
                        <div
                          @click.prevent="setIdDriver"
                          :class="{ selectedUpload: isDriversLicense }"
                          class="uploadForm"
                        >
                          <div class="form-row justify-content-center">
                            ID or Drivers License
                            <font-awesome-icon
                              v-if="isDriversLicense"
                              icon="check-circle"
                              class="checkUpload"
                            />
                          </div>
                        </div>
                      </div>

                      <div class="form-group col-md-4" style="cursor: pointer;">
                        <div
                          @click.prevent="setPassport"
                          :class="{ selectedUpload: isPassport }"
                          class="uploadForm"
                        >
                          <div class="form-row justify-content-center">
                            Passport
                            <font-awesome-icon
                              v-if="isPassport"
                              icon="check-circle"
                              class="checkUpload"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-xs-12 text-center">
                    <br />
                    <br />
                    <button
                      type="button"
                      class="btn btn-primary submit-form-lg"
                      id="btnSubmitDocCenter"
                      :disabled="!(isPassport || isDriversLicense)"
                      @click.prevent="setUpload"
                    >
                      Continue
                    </button>
                  </div>
                </div>

                <div v-if="upload && !review">
                  <h2 v-if="isDriversLicense" class="text-center uploadTitle">
                    Government Issued ID
                  </h2>
                  <h2 v-if="isPassport" class="text-center uploadTitle">
                    Passport
                  </h2>
                  <p class="text-left returnToUpload">
                    <span @click="returnToUpload" style="cursor: pointer;"
                      >Return</span
                    >
                  </p>

                  <div class="flex-column cardsUpload">
                    <div class="form-row justify-content-center">
                      <div class="form-group cardsBack col-md-6 ">
                        <div
                          class="frontCard"
                          @dragenter="onDragEnter"
                          @dragleave="onDragLeave"
                          @drop="onDropFront"
                          @dragover.prevent
                          :class="{ dragging: isDragging }"
                        >
                          <font-awesome-icon
                            icon="cloud-upload-alt"
                            class="cardCancel"
                          />
                          <p v-if="isDriversLicense">Front of card</p>
                          <p v-if="isPassport">Image of passport</p>
                          <p v-if="!selectedFileFrontName">
                            Drag &amp; drop your files or
                            <input
                              @change="onFileSelectedFront"
                              type="file"
                              name="fileFront"
                              id="fileFront"
                              class="inputfile"
                              accept="image/*"
                            />
                            <label
                              class="browseUpload"
                              @change="onFileSelectedFront"
                              for="fileFront"
                              >browse</label
                            >
                          </p>
                          <p v-else>
                            Drag &amp; drop your files or
                            <font-awesome-icon
                              icon="check-circle"
                              class="uploadDone"
                            />
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="isDriversLicense"
                      class="form-row justify-content-center"
                    >
                      <div
                        class="form-group cardsBack col-md-6"
                        style="margin-top: 0"
                      >
                        <div
                          class="backCard"
                          @dragenter="onDragEnterBack"
                          @dragleave="onDragLeaveBack"
                          @drop="onDropBack"
                          @dragover.prevent
                          :class="{ dragging: isDraggingBack }"
                        >
                          <font-awesome-icon icon="cloud-upload-alt" />
                          <p>Back of card</p>
                          <p>
                            Drag &amp; drop your files or
                            <input
                              @change="onFileSelectedBack"
                              type="file"
                              name="fileBack"
                              id="fileBack"
                              class="inputfile"
                              accept="image/*"
                            />
                            <label
                              v-if="!selectedFileBackName"
                              class="browseUpload"
                              @change="onFileSelectedBack"
                              for="fileBack"
                              >browse</label
                            >
                            <font-awesome-icon
                              v-if="selectedFileBackName"
                              icon="check-circle"
                              class="uploadDone"
                            />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-xs-12 text-center">
                    <br />
                    <br />
                    <button
                      v-if="isDriversLicense"
                      :disabled="!selectedFileBack || !selectedFileFront"
                      type="button"
                      class="btn btn-primary submit-form-lg submitDocUpload"
                      @click.prevent="setReview"
                    >
                      Continue
                    </button>
                    <button
                      v-if="isPassport"
                      :disabled="!selectedFileFront"
                      type="button"
                      class="btn btn-primary submit-form-lg submitDocUpload"
                      @click.prevent="setReview"
                    >
                      Continue
                    </button>
                  </div>
                </div>

                <div v-if="upload && review && !isUploaded">
                  <h2 class="text-center uploadTitle">Government Issued ID</h2>
                  <p class="text-center errorMessage"></p>
                  <div class="flex-column">
                    <div class="form-row justify-content-center">
                      <div class="form-group reviewBack col-md-6 text-left ">
                        <p v-if="isDriversLicense" class="bold">Front</p>
                        <p v-if="isPassport" class="bold">Passport</p>
                        <font-awesome-icon
                          icon="check-circle"
                          style="margin-left: 5px; color: #ea4c89;"
                        />
                        <div class="text-center screenShot">
                          <p>{{ selectedFileFrontName }}</p>
                          <font-awesome-icon
                            @click.prevent="cancelUploadFront"
                            icon="times"
                            class="cancelUpload"
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="isDriversLicense"
                      class="form-row justify-content-center"
                    >
                      <div
                        class="form-group reviewBack col-md-6 text-left"
                        style="margin-top: 0"
                      >
                        <p class="bold">Back</p>
                        <font-awesome-icon
                          icon="check-circle"
                          style="margin-left: 5px; color: #ea4c89;"
                        />
                        <div class="text-center screenShot">
                          <p>{{ selectedFileFrontName }}</p>
                          <font-awesome-icon
                            @click.prevent="cancelUploadBack"
                            icon="times"
                            class="cancelUpload"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-xs-12 text-center">
                    <br />
                    <br />
                    <button
                      type="button"
                      class="btn btn-primary submit-form-lg submitDocUpload"
                      @click.prevent="uploadImage"
                    >
                      Continue
                    </button>
                  </div>
                </div>

                <div v-if="upload && review && isUploaded">
                  <h2 class="text-center uploadTitle">You're All Set!</h2>
                  <div class="flex-column">
                    <div class="form-row justify-content-center">
                      <div class="col-md-12 text-center finalUpload">
                        <p id="finalDocument">We've received your documents.</p>
                      </div>
                    </div>
                    <div class="form-row justify-content-center">
                      <div
                        class="col-md-12 text-center finalUpload"
                        style="margin-top: 0"
                      >
                        <p>Click through to view your client portal.</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-xs-12 text-center">
                    <br />
                    <br />
                    <button
                      type="button"
                      class="btn btn-primary submit-form-lg submitDocUpload"
                      @click="goToDashboard"
                    >
                      See Portal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";
import { mapMutations } from "vuex";

import { getApplicationData } from "@/user-application/application/api";
import { uploadDocument } from "@/user-application/document-upload/api";
import Layout from "@/user-application/layout/pages/Layout.vue";
import showErrorToast from "@/helpers/errorToast";

export default Vue.extend({
  components: {
    Layout,
  },

  data() {
    return {
      dragCount: 0,
      dragCountBack: 0,
      isUploaded: false,
      isDriversLicense: false,
      isDragging: false,
      isDraggingBack: false,
      isUploading: false,
      lastStep: null as null | string,
      isPassport: false,
      review: false,
      selectedFileBack: null as null | string,
      selectedFileBackName: null as null | string,
      selectedFileFront: null as null | string,
      selectedFileFrontName: null as null | string,
      upload: false,
    };
  },

  methods: {
    ...mapMutations(["setStep", "setIsLoading"]),
    async goToDashboard() {
      await this.$router.push({ name: "userDashboard" });
    },
    onDragEnter(e: Event) {
      e.preventDefault();

      this.dragCount++;
      this.isDragging = true;
    },
    onDragLeave(e: Event) {
      e.preventDefault();

      this.dragCount--;

      if (this.dragCount <= 0) {
        this.isDragging = false;
      }
    },
    onDragEnterBack(e: Event) {
      e.preventDefault();

      this.dragCountBack++;
      this.isDraggingBack = true;
    },
    onDragLeaveBack(e: Event) {
      e.preventDefault();

      this.dragCountBack--;
      if (this.dragCountBack <= 0) {
        this.isDraggingBack = false;
      }
    },
    onDropFront(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();

      this.isDragging = false;
      const selectedImage: File | undefined = e.dataTransfer?.files[0];
      this.selectedFileFrontName = e.dataTransfer?.files[0]?.name || "";
      if (selectedImage) {
        this.createBase64ImageFront(selectedImage);
      }
    },
    onDropBack(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();

      this.isDragging = false;
      const selectedImage = e.dataTransfer?.files[0];
      this.selectedFileBackName = e.dataTransfer?.files[0]?.name || "";
      if (selectedImage) {
        this.createBase64ImageBack(selectedImage);
      }
    },
    onFileSelectedFront(e: any) {
      const selectedImage = e.target?.files[0];
      this.selectedFileFrontName = e.target.files[0].name;
      this.createBase64ImageFront(selectedImage);
    },
    createBase64ImageFront(fileObject: File) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFileFront = e.target?.result;
        this.saveImgFront(this.selectedFileFront || "");
      };
      reader.readAsDataURL(fileObject);
    },
    saveImgFront(img: string) {
      this.selectedFileFront = img;
    },
    async uploadImage() {
      try {
        this.setIsLoading(true);
        if (this.isPassport) {
          const passport = this.selectedFileFront || "";
          const passportBase64 = passport.split("base64,")[1];
          const requestBody = {
            documentType: "passport" as "passport",
            passport: passportBase64,
          };

          await uploadDocument(requestBody);

          this.isUploaded = true;
          this.setIsLoading(false);
        } else {
          const driversLicenseFront = this.selectedFileFront || "";
          const driversLicenseFrontBase64 = driversLicenseFront.split(
            "base64,"
          )[1];
          const driversLicenseBack = this.selectedFileBack || "";
          const driversLicenseBackBase64 = driversLicenseBack.split(
            "base64,"
          )[1];

          const requestBody = {
            documentType: "drivers license" as "drivers license",
            driversLicenseFront: driversLicenseFrontBase64,
            driversLicenseBack: driversLicenseBackBase64,
          };
          await uploadDocument(requestBody);

          this.isUploaded = true;
          this.setIsLoading(false);
        }
      } catch (error) {
        this.setIsLoading(false);

        let errorMessage = "";
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = error.message;
        }

        showErrorToast(this, "error", errorMessage);
      }
    },
    onFileSelectedBack(e: any) {
      const selectedImage = e.target.files[0]; // get first file
      this.selectedFileBackName = e.target.files[0].name;
      this.createBase64ImageBack(selectedImage);
    },
    createBase64ImageBack(fileObject: File) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFileBack = e.target.result;
        this.saveImgBack(this.selectedFileBack || "");
      };
      reader.readAsDataURL(fileObject);
    },
    saveImgBack(img: string) {
      this.selectedFileBack = img;
    },
    cancelUploadFront() {
      this.selectedFileFront = null;
      this.selectedFileFrontName = null;
      this.review = false;
    },
    cancelUploadBack() {
      this.selectedFileBack = null;
      this.selectedFileBackName = null;
      this.review = false;
    },
    setIdDriver() {
      this.isUploading = false;
      this.isDriversLicense = true;
      this.isPassport = false;
    },
    setPassport() {
      this.isUploading = false;
      this.isPassport = true;
      this.isDriversLicense = false;
    },
    returnToUpload() {
      this.isUploading = false;
      this.isPassport = false;
      this.isDriversLicense = false;
      this.upload = false;
    },
    setUpload() {
      this.upload = true;
    },
    setReview() {
      this.review = true;
    },
  },

  async created() {
    try {
      this.setStep(6);
      const { data } = await getApplicationData();
      const { isCompleted, lastStep } = data;

      if (isCompleted) {
        await this.$router.push({ name: "userDashboard" });
      } else if (lastStep !== "document-upload") {
        await this.$router.push({ name: lastStep });
      } else {
        this.lastStep = lastStep;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        await this.$router.push({ name: "userLogin" });
      } else {
        showErrorToast(this, "error", error.message);
      }
    }
  },
});
</script>

<style>
.hide {
  display: none;
}

.errorMessage {
  color: #cf1111;
}

progress {
  background-color: #ddd;
  border: 0;
  height: 12px;
  border-radius: 20px;
  transition: all;
}

progress::-webkit-progress-bar {
  background-color: #ddd;
  border: 0;
  height: 12px;
  border-radius: 20px;
  transition: all;
}

progress::-webkit-progress-value {
  background-color: #ea4c89;
  border: 0;
  height: 12px;
  border-radius: 20px;
  transition: all;
}

progress::-moz-progress-bar {
  background-color: #ddd;
  border: 0;
  height: 12px;
  border-radius: 20px;
  transition: all;
}
</style>
