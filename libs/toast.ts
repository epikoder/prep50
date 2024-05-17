// @deno-types="npm:@types/toastify-js"
import Toastify from "npm:toastify-js"

export type ToastStatus = 'success' | 'warning' | 'failed'
function showSuccess(text: string, options?: Omit<Toastify.Options, "text" | 'class'>) {
    showToast(text, 'success', options)
}
function showWarning(text: string, options?: Omit<Toastify.Options, "text" | 'class'>) {
    showToast(text, 'warning', options)
}
function showFailed(text: string, options?: Omit<Toastify.Options, "text" | 'class'>) {
    showToast(text, 'failed', options)
}
export {
    showFailed, showSuccess, showWarning,
}

function showToast(text: string, status: ToastStatus, options?: Omit<Toastify.Options, "text" | 'class'>) {
    const style = status == 'success' ? "text-blue" : ""
    Toastify({
        ...options,
        className: `absolute z-[9999999] px-4 bg-blue-500 ${style}`,
        text
    }).showToast()
}