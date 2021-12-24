using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Model.KakaoViewModels
{
    public class KakaoViewModel
    {
        public int Id { get; set; }
        public string Connected_at { get; set; }
        public KakaoAccountViewModel Kakao_account { get; set; }

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
