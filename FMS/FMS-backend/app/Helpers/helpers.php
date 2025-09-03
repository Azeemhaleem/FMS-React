<?php

if (!function_exists('maskEmail')) {
    function maskEmail($email)
    {
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            list($user, $domain) = explode('@', $email);

            $userLength = strlen($user);
            $domainParts = explode('.', $domain);

            $maskedUser = substr($user, 0, 2) . str_repeat('*', $userLength - 2);

            $maskedDomainSegment = $domainParts[0];
            if (strlen($maskedDomainSegment) > 3) {
                $maskedDomainSegment = substr($maskedDomainSegment, 0, 2) . str_repeat('*', strlen($maskedDomainSegment) - 3) . substr($maskedDomainSegment, -1);
            } else {
                $maskedDomainSegment = str_repeat('*', strlen($maskedDomainSegment));
            }

            $domainParts[0] = $maskedDomainSegment;
            $maskedDomain = implode('.', $domainParts);


            return $maskedUser . '@' . $maskedDomain;
        }
        return $email;
    }
}