<#import "template.ftl" as layout>
<@layout.htmlEmailLayout ; section>
    <#if section = "title">
        ${msg("emailVerificationTitle", linkExpiration, realmName)?no_esc}
    </#if>
    <#if section = "subtitle">
        ${msg("emailVerificationSubtitle")?no_esc}
    </#if>
     <#if section = "buttonText">
        ${msg("emailVerificationButton")?no_esc}
    </#if>
</@layout.htmlEmailLayout>