// Deprecated compatibility shim.
// The app now uses Firebase auth helpers from `firebase-auth.ts` and `firebase-admin.ts`.

export const auth = {
  api: {
    async getSession(): Promise<null> {
      console.warn(
        "auth.api.getSession is deprecated. Use Firebase auth helpers from lib/firebase-auth.ts or lib/auth-guards.ts instead."
      );
      return null;
    },
  },
};
