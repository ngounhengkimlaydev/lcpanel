<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-bold text-highlighted">
        Setup Tips
      </h3>
    </template>

    <div class="space-y-3 text-sm text-muted">
      <p>
        Make sure your domain A record points to your server public IP.
      </p>

      <p>
        Enable SSL only after DNS is already pointing correctly.
      </p>

      <p>
        Use the document root for your website files, for example:
        <code class="rounded bg-muted px-1 py-0.5">/var/www/example.com</code>
      </p>

      <p>
        Database and FTP accounts are optional. Enable them only when the website needs them.
      </p>
    </div>
  </UCard>
</template>