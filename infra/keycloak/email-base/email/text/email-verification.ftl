<#ftl output_format="plainText">
${msg("emailVerificationBody",link, linkExpiration, user.username, user.email, linkExpirationFormatter(linkExpiration))}