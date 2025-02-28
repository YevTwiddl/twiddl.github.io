// Email.js configuration (for development only)
const emailjsConfig = {
  publicKey: 'N1FpZBJr30Yt8HVFl',
  serviceId: 'service_s4demlz',
  templateId: 'template_xay64zb'
};

// Initialize Email.js
(function() {
  emailjs.init(emailjsConfig.publicKey);
})();

// Set up the waitlist form submission
document.addEventListener('DOMContentLoaded', function() {
  const waitlistForm = document.querySelector('.waitlist-form');
  
  if (waitlistForm) {
    waitlistForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const emailInput = this.querySelector('input[type="email"]');
      const submitButton = this.querySelector('button[type="submit"]');
      
      if (!emailInput.value.trim()) {
        return; // Don't submit empty email
      }
      
      // Remove any existing messages
      const existingMessages = waitlistForm.parentNode.querySelectorAll('.success-message, .error-message');
      existingMessages.forEach(msg => msg.remove());
      
      // Disable the button and show loading state
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      
      // Prepare the parameters for Email.js
      const templateParams = {
        to_email: 'contact@twiddl.dev',
        from_email: emailInput.value,
        message: `New waitlist signup from: ${emailInput.value}`
      };
      
      // Send the email using Email.js
      emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        templateParams
      )
      .then(function(response) {
        console.log('SUCCESS!', response.status, response.text);
        
        // Show success message
        emailInput.value = '';
        submitButton.textContent = 'Submitted!';
        
        // Create and show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = 'Thank you for joining our waitlist!';
        waitlistForm.parentNode.insertBefore(successMsg, waitlistForm.nextSibling);
        
        // Reset button after 3 seconds
        setTimeout(() => {
          submitButton.disabled = false;
          submitButton.textContent = 'Get Early Access';
        }, 3000);
      })
      .catch(function(error) {
        console.log('FAILED...', error);
        
        // Show error message
        submitButton.textContent = 'Try Again';
        submitButton.disabled = false;
        
        // Create and show error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Something went wrong. Please try again.';
        waitlistForm.parentNode.insertBefore(errorMsg, waitlistForm.nextSibling);
      });
    });
  }
}); 