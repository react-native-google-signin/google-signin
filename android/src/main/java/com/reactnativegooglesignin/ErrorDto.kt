package com.reactnativegooglesignin

import com.google.android.gms.auth.api.signin.GoogleSignInStatusCodes
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.UnsupportedApiCallException

class ErrorDto(e: Exception, errCodeFallback: String?) {
  var code: String? = null
  var message: String? = null

  init {
    // Google's exceptions are not very helpful and error codes can be context-sensitive
    val localizedMessage = e.localizedMessage ?: e.message
    if (e is ApiException) {
      val code: Int = e.statusCode
      // we apply some heuristic to try make the error message more useful
      val minLengthToBeInsightful = 10
      val isInsightful =
          localizedMessage != null && localizedMessage.length > minLengthToBeInsightful
      // remove code from message, users don't want to see it and it's already present in the code
      // field
      val errorDescription: String =
          if (isInsightful && localizedMessage != null) localizedMessage.replaceFirst("$code: ".toRegex(), "")
          else GoogleSignInStatusCodes.getStatusCodeString(code)

      // there are several types of cancellations: they can be observed (1) when cancelling sign in
      // and (2) when calling getAccessToken and dismissing the modal
      // we treat them as equivalent
      val isCancelled = code == GoogleSignInStatusCodes.SIGN_IN_CANCELLED || e.status.isCanceled
      val codeInt = if (isCancelled) GoogleSignInStatusCodes.SIGN_IN_CANCELLED else code
      this.code = codeInt.toString()
      this.message = errorDescription
    } else if (e is UnsupportedApiCallException) {
      this.code = errCodeFallback
      this.message =
          "$localizedMessage Make sure you have the latest version of Google Play Services installed."
    } else {
      this.code = errCodeFallback
      this.message = localizedMessage
    }
  }
}
