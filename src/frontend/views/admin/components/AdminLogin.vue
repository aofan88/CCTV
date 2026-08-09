<template>
  <div id="login-overlay" class="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
    <div class="my-auto w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
      <!-- Header / Logo -->
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-inner">
          <svg class="size-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <rect x="8" y="11" width="8" height="5" rx="1"/>
            <path d="M10 11V9a2 2 0 1 1 4 0v2"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {{ trans.adminLogin || '控制台登入' }}
        </h2>
        <p class="mt-2 text-xs text-slate-400 sm:text-sm">
          {{ trans.enterCredentials || '請輸入管理員憑證以存取系統' }}
        </p>
      </div>

      <form @submit.prevent="$emit('login')" class="space-y-4">
        <!-- Multiple API Endpoint Mode -->
        <div v-if="isMultipleMode" class="space-y-1.5">
          <label class="text-xs font-medium text-slate-300">{{ trans.apiEndpoint || 'API 站點' }}</label>
          <div class="relative">
            <select
              :value="selectedApiIndex"
              class="w-full rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              @change="$emit('api-index-change', Number($event.target.value))"
            >
              <option
                v-for="(base, index) in apiBases"
                :key="index"
                :value="index"
                class="bg-slate-900 text-slate-200"
              >
                [{{ index }}] {{ base }}
              </option>
            </select>
          </div>
        </div>

        <!-- Username Input -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-slate-300">{{ trans.username || '帳號' }}</label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg class="size-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <input
              type="text"
              name="username"
              autocomplete="username"
              v-model="loginForm.username"
              required
              class="w-full rounded-lg border border-white/10 bg-slate-800/60 pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="admin"
            >
          </div>
        </div>

        <!-- Password Input -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-slate-300">{{ trans.password || '密碼' }}</label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg class="size-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <input
              :type="passwordVisible.login ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              v-model="loginForm.password"
              required
              class="w-full rounded-lg border border-white/10 bg-slate-800/60 pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="••••••••"
            >
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition-colors"
              @click="$emit('toggle-password', 'login')"
            >
              <svg v-if="!passwordVisible.login" class="size-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else class="size-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.49 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Turnstile -->
        <div v-if="turnstileSiteKey && (turnstileLoginEnabled || (turnstileEnabled && !turnstileVerified))" class="pt-2">
          <div id="admin-turnstile-container" class="flex justify-center"></div>
        </div>

        <!-- Error Alert -->
        <div v-if="loginError" id="login-error" class="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 flex items-center gap-2">
          <span>⚠️ {{ loginError }}</span>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loginLoading"
          class="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="loginLoading" class="size-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <span>{{ loginLoading ? '登入中...' : (trans.login || '登入') }}</span>
        </button>
      </form>
    </div>

    <!-- Footer -->
    <Footer class="mt-8 text-slate-500 text-xs" />
  </div>
</template>

<script setup>
import Footer from '../../../components/Footer.vue'

defineProps({
  trans: { type: Object, required: true },
  isMultipleMode: { type: Boolean, default: false },
  apiBases: { type: Array, default: () => [] },
  selectedApiIndex: { type: Number, default: 0 },
  loginForm: { type: Object, required: true },
  passwordVisible: { type: Object, required: true },
  loginError: { type: String, default: '' },
  loginLoading: { type: Boolean, default: false },
  turnstileSiteKey: { type: String, default: '' },
  turnstileLoginEnabled: { type: Boolean, default: false },
  turnstileEnabled: { type: Boolean, default: false },
  turnstileVerified: { type: Boolean, default: false }
})

defineEmits(['login', 'toggle-password', 'api-index-change'])
</script>
