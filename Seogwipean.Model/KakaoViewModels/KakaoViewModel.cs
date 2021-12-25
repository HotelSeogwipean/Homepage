using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Model.KakaoViewModels
{

    /*
age_range: "20~29"
age_range_needs_agreement: false
birthday: "0729"
birthday_needs_agreement: false
birthday_type: "SOLAR"
birthyear: "1995"
birthyear_needs_agreement: false
email: "sanghun0729@naver.com"
email_needs_agreement: false
gender: "male"
gender_needs_agreement: false
has_age_range: true
has_birthday: true
has_birthyear: true
has_email: true
has_gender: true
has_phone_number: true
is_email_valid: true
is_email_verified: true
name: "이상훈"
name_needs_agreement: false
phone_number: "+82 10-4350-8320"
phone_number_needs_agreement: false
token: "ozl4akMpKsM68hpJ0w2n4BvT0l1RYn90kSmJcgo9cpgAAAF98Pkw6Q"
     */
    public class KakaoViewModel
    {
        public int Id { get; set; }
        public string Connected_at { get; set; }
        //public KakaoAccountViewModel Kakao_account { get; set; }
        public bool Name_needs_agreement { get; set; }
        public bool Email_needs_agreement { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public bool Has_phone_number { get; set; }
        public bool Phone_number_needs_agreement { get; set; }
        public string Phone_number { get; set; }
        public string Has_age_rage { get; set; }
        public bool Age_range_needs_agreement { get; set; }
        public string Age_range { get; set; }
        public bool Has_birthyear { get; set; }
        public bool Birthyear_needs_agreement { get; set; }
        public int Birthyear { get; set; }
        public bool Has_birthday { get; set; }
        public bool Birthday_needs_agreement { get; set; }
        public int Birthday { get; set; }
        public string Birthday_type { get; set; }
        public bool Has_gender { get; set; }
        public bool Gender_needs_agreement { get; set; }
        public string Gender { get; set; }
        public string Token { get; set; }
        public bool Has_age_range { get; set; }
        public bool Has_email { get; set; }
        public bool Is_email_valid { get; set; }
        public bool Is_email_verified { get; set; }
        public int Search { get; set; }
    }

    public class KakaoAccountViewModel
    {
        public bool Name_needs_agreement { get; set; }
        public string Name { get; set; }
        public bool Has_phone_number { get; set; }
        public bool Phone_number_needs_agreement { get; set; }
        public string Phone_number { get; set; }
        public string Has_age_rage { get; set; }
        public bool Age_range_needs_agreement { get; set; }
        public string Age_range { get; set; }
        public bool Has_birthyear { get; set; }
        public bool Birthyear_needs_agreement { get; set; }
        public int Birthyear { get; set; }
        public bool Has_birthday { get; set; }
        public bool Birthday_needs_agreement { get; set; }
        public int Birthday { get; set; }
        public string Birthday_type { get; set; }
        public bool Has_gender { get; set; }
        public bool Gender_needs_agreement { get; set; }
        public string Gender { get; set; }
    }
}
