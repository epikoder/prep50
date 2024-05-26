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
    const style = status == 'success' ? "bg-[#46b5ff]" : status == 'warning' ? 'bg-yellow-500' : 'bg-red-500'
    Toastify({
        ...options,
        className: `top-12 right-6 absolute z-[9999999] px-4 rounded-lg px-4 py-2 text-white text-xs ${style}`,
        position: 'left',
        text
    }).showToast()
}