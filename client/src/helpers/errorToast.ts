import { CombinedVueInstance, Vue } from "vue/types/vue";

const showErrorToast = (
  vueInstance: CombinedVueInstance<
    Vue,
    any,
    unknown,
    unknown,
    Readonly<Record<never, any>>
  >,
  icon: string,
  title: string
) => {
  const Toast = vueInstance.$swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 7000,
    timerProgressBar: true,
    didOpen: (toast: HTMLElement) => {
      toast.addEventListener("mouseenter", vueInstance.$swal.stopTimer);
      toast.addEventListener("mouseleave", vueInstance.$swal.resumeTimer);
    },
  });
  Toast.fire({ icon, title });
};

export default showErrorToast;
