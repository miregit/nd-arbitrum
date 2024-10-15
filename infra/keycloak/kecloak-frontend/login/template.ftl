<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
		<head>
			<script>
            	localStorage.setItem('redirectUrl', "${properties.cloudUrl!}");
				localStorage.setItem('errorPath', "${properties.cloudPathError!}");
				localStorage.setItem('onboardingPath', "${properties.cloudPathOnboarding!}");
        	</script>
             <#nested "htmlBody">
        </head>
        <body>
            <#nested "form">
        </body>
</html>
</#macro>
