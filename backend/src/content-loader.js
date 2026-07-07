const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { getPageOverrides } = require("./content-overrides");

const backendRoot = path.resolve(__dirname, "..");
const configPath = path.join(backendRoot, "data", "site-config.json");
const defaultHomeProductIds = ["coldrex", "enterogermina", "sinulan-duo", "vitrum-immunaktiv"];
const countryContentProfiles = {
  azerbaijan: {
    replacements: {
      default: [
        ["STADA Kazakhstan", "STADA Azerbaijan"],
        ["Казахстане", "Азербайджане"],
        ["Казахстан", "Азербайджан"],
        ["Kazakhstan", "Azerbaijan"],
        ["Биосфера", "Biosfera"],
        ["Аптека плюс", "Apteka Plus"],
      ],
    },
    pageTitles: {
      az: {
        "index.html": "STADA - Şirkət haqqında",
        "culture.html": "STADA - Korporativ mədəniyyət",
        "history.html": "STADA - Şirkətin tarixi",
        "products/index.html": "STADA - Məhsullarımız",
        "worldwide.html": "STADA - Filiallarımız",
      },
    },
    text: {
      ru: {
        site_name: "STADA Azerbaijan",
        hero_kicker: "STADA Azerbaijan",
        hero_sub3: "Развиваем доступные решения для семей в Азербайджане.",
        hero_text3: "В Азербайджане доверие к врачам остается важной основой заботы о здоровье",
        news_3_text: "Профилактика, доступная информация и доверительный диалог со специалистами помогают поддерживать здоровье каждый день.",
        footer_brand_text: "Мы объединяем международный опыт STADA и локальную близость к пациентам, специалистам и партнерам в Азербайджане.",
      },
      az: {
        about_heading: "STADA haqqında",
        benefits_heading: "Üstünlüklər",
        button_products: "Məhsullar",
        career_button: "Vakansiyalara baxın",
        career_heading: "STADA-da karyera",
        cta_more: "Daha ətraflı",
        culture_career_cta: "Vakansiyalara baxın",
        culture_change_title: "Dəyişiklik",
        culture_challenge_title: "Çağırış",
        culture_eyebrow: "STADA mədəniyyəti",
        culture_heading: "Etimad mədəniyyəti",
        culture_hero_lead: "Sürətli, açıq və məsuliyyətli hərəkət edirik.",
        culture_page_title: "STADA - Korporativ mədəniyyət",
        culture_purpose_eyebrow: "İnsanların sağlamlığının qayğısına qalmaq",
        culture_purpose_heading: "Aptek köklərindən etimad mədəniyyətinə",
        culture_urgency_title: "Çeviklik",
        culture_values_cta: "Dəyərlərə baxın",
        footer_access_title: "Əlçatanlıq",
        footer_back_top: "Yuxarı",
        footer_brand_text: "STADA-nın beynəlxalq təcrübəsini Azərbaycanda pasiyentlərə, mütəxəssislərə və tərəfdaşlara yaxınlıqla birləşdiririk.",
        footer_company_title: "Şirkət",
        footer_global_link: "STADA Global",
        footer_products_title: "Məhsullar",
        footer_rights: "Bütün hüquqlar qorunur.",
        footer_trust_countries: "100+ ölkə",
        footer_trust_years: "130+ il təcrübə",
        footer_warning_text: "Saytdakı məlumat mütəxəssis məsləhətini əvəz etmir. Dərman vasitələrindən istifadə etməzdən əvvəl təlimatı oxuyun.",
        footer_warning_title: "Vacibdir",
        hero_kicker: "STADA Azerbaijan",
        hero_products_description: "Müxtəlif terapevtik sahələrdə yüksək keyfiyyətli generiklər və istehlakçı sağlamlığı məhsulları təqdim edirik.",
        hero_products_heading: "Daha yaxşı həyat üçün keyfiyyətli dərmanlar",
        hero_products_label: "MƏHSULLARIMIZ",
        hero_sub1: "Hər gün etibar edilən keyfiyyətli dərmanlar.",
        hero_sub2: "STADA-nın təcrübəsi milyonlarla insanın sağlamlığını dəstəkləməyə kömək edir.",
        hero_sub3: "Azərbaycandakı ailələr üçün əlçatan həllər inkişaf etdiririk.",
        hero_text3: "Azərbaycanda sağlamlıqla bağlı etibarlı dialoq gündəlik qayğının vacib hissəsidir",
        hero_title1: "Sağlamlığın qayğısına qalırıq",
        hero_title2: "Güzəştsiz keyfiyyət",
        hero_title3: "Pasiyentlərə yaxın",
        about_par1: "STADA yüksək keyfiyyətli əczaçılıq məhsullarının aparıcı istehsalçısıdır. Aptek ənənələrindən başlayan 130 ildən artıq tariximizlə etibarlı tərəfdaş kimi tanınırıq.",
        about_par2: "Şirkət üç əsas istiqamətə fokuslanır: istehlakçı sağlamlığı məhsulları, generiklər və xüsusi preparatlar. Bu gün STADA dünyanın 100-dən çox ölkəsində fəaliyyət göstərir və 11 600-dən çox iş yeri təmin edir.",
        about_list1: "Əlçatanlıq: generik məhsullarımız səhiyyəni daha çox insan üçün əlçatan etməyə kömək edir.",
        about_list2: "İnnovasiya: həyat keyfiyyətini yaxşılaşdırmaq üçün tədqiqat və inkişafa sərmayə yatırırıq.",
        about_list3: "Etibarlılıq: güvənə biləcəyiniz tərəfdaş olmağa çalışırıq.",
        hero_caption_logo: "STADA-nın insanların sağlamlığının qayğısına qalmaqda 130 illik təcrübəsi",
        stats_sales: "2024-cü ildə qrup satışları 4 059 mln avro",
        stats_employees: "Dünyada 11 600-dən çox əməkdaş",
        stats_countries: "100-dən çox ölkədə iştirak",
        hero_metric_years: "il təcrübə",
        hero_text1: "CapVest STADA-nın nəzarət paketini Bain Capital və Cinven-dən alır",
        news_1_text: "Sövdələşmə qrupun inkişafında yeni mərhələ açır və STADA-nın beynəlxalq bazarlarda uzunmüddətli strategiyasını gücləndirir.",
        hero_text2: "STADA-nın inkişaf yolu 2024-cü ildə davam edir: satış və mənfəətdə ciddi artım bazarı üstələdi.",
        news_2_text: "Şirkət əczaçılıq bazarının dinamikasını üstələyərək satış və mənfəətdə dayanıqlı artım nümayiş etdirir.",
        news_4_title: "STADA Top Employer Europe 2025 kimi tanınıb",
        news_4_text: "Bu tanınma STADA komandaları üçün inkişaf mədəniyyətini, əməkdaşlara qayğını və inkişaf imkanlarını əks etdirir.",
        news_5_title: "STADA portfeli güclü istehlakçı brendlərini və generikləri birləşdirir",
        news_5_text: "Məhsul xətti müxtəlif terapevtik sahələrdə pasiyentlərin sağlamlığını dəstəkləməyə kömək edir.",
        news_6_title: "Enterogermina mikrofloranın sağlamlığını dəstəkləyir",
        news_6_text: "Probiotik istiqaməti STADA-nın gündəlik sağlamlıq üçün həllərinin vacib hissəsi olaraq qalır.",
        news_7_title: "Coldrex soyuqdəymə mövsümündə tanınan brend olaraq qalır",
        news_7_text: "Soyuqdəymə simptomlarını yüngülləşdirməyə kömək edən vasitələr pasiyentlərin gündəlik ritmini qorumağa dəstək olur.",
        news_8_title: "Vitrum Immunaktiv gündəlik dəstək fokusundadır",
        news_8_text: "Vitamin-mineral kompleksləri rifahın qayğısına qalmaq üçün məhsul portfelini tamamlayır.",
        career_par1: "STADA-da işləmək unikal bir inkişaf yoludur. Məzunlar üçün başlanğıc rollardan ekspert vəzifələrinə qədər müxtəlif və maraqlı imkanlar təklif edirik. Vakansiyalarımız geniş bacarıq spektrini əhatə edir və yalnız əczaçılıq sahəsi ilə məhdudlaşmır: təchizat zənciri, marketinq, maliyyə, layihə idarəçiliyi və digər istiqamətlərdə də imkanlar tapa bilərsiniz.",
        career_fact1: "rəhbər vəzifələrində çalışanlar qadınlardır",
        career_fact2: "əməkdaş məqsədimizlə qürur duyur: insanların sağlamlığının etibarlı tərəfdaş kimi qayğısına qalmaq",
        career_fact3: "dünyada əməkdaş",
        career_fact4: "komandamızda milliyyət",
        career_fact5: "Sustainalytics ESG 2023 reytinqinə görə əczaçılıq şirkətləri arasında",
        culture_purpose_text_1: "STADA 1895-ci ildə sadə bir ideya ilə başladı: dərmanları vahid standartlara uyğun istehsal etmək və keyfiyyətli yardımı daha əlçatan etmək.",
        culture_purpose_text_2: "Bu gün həmin köklər yanaşmamızda görünür: məsuliyyət, açıq dialoq və insan üçün real faydaya fokus.",
        culture_purpose_label: "Məqsədimiz",
        culture_purpose_statement: "İnsanların sağlamlığının etibarlı tərəfdaş kimi qayğısına qalmaq.",
        culture_fact_origin: "aptek kökləri",
        culture_fact_years: "il etimad",
        culture_fact_values: "ortaq dəyərlər",
        culture_values_eyebrow: "Dəyərlərimiz",
        culture_values_heading: "Gündəlik qərarlar üçün prinsiplər",
        culture_values_intro: "Dörd dəyər komandalarımıza məsuliyyət götürməyə, daha sürətli öyrənməyə, maneəsiz əməkdaşlıq etməyə və etimadı qorumağa kömək edir.",
        culture_integrity_title: "Dürüstlük",
        culture_integrity_tagline: "Doğru olanı etmək.",
        culture_entrepreneurship_title: "Sahibkarlıq ruhu",
        culture_entrepreneurship_tagline: "Cəsarətlə düşünmək.",
        culture_agility_title: "Çeviklik",
        culture_agility_tagline: "Dəyişikliklə böyümək.",
        culture_one_tagline: "Bir komandanın gücü.",
        culture_trust_title: "Etimad",
        culture_trust_text: "Məlumatlara diqqətlə yanaşır və dürüst dialoqu seçirik.",
        culture_compliance_title: "Qaydalara uyğunluq",
        culture_compliance_text: "Standartlara əməl edir, səhvləri qəbul edir və səbəbləri aradan qaldırırıq.",
        culture_respect_title: "Hörmət",
        culture_respect_text: "Hörmətlə ünsiyyət qurur və konstruktiv rəy veririk.",
        culture_speakup_title: "Açıq söz",
        culture_speakup_text: "Açıq danışır və prosesləri yaxşılaşdırmağa kömək edirik.",
        culture_sustainability_title: "Dayanıqlılıq və müxtəliflik",
        culture_sustainability_text: "Fərdiliyi qiymətləndirir və fərqləri güc kimi görürük.",
        culture_risk_title: "Düşünülmüş risk",
        culture_risk_text: "Əsaslandırılmış qərarlar qəbul edir və artıq mürəkkəbliyi aradan qaldırırıq.",
        culture_innovation_title: "İnnovasiya",
        culture_innovation_text: "Vərdiş etdiyimiz yanaşmaları sual altına alır və daha yaxşı həllər axtarırıq.",
        culture_anticipation_title: "Öncədən görmə",
        culture_anticipation_text: "Pasiyentlərin, biznesin və tərəfdaşların ehtiyaclarını daha erkən görürük.",
        culture_ownership_title: "İdeyalara sahiblik",
        culture_ownership_text: "Təşəbbüs göstərir və nəticəyə görə məsuliyyət daşıyırıq.",
        culture_open_title: "Açıqlıq",
        culture_open_text: "Yeni imkanları görür və həllə fokuslanırıq.",
        culture_change_text: "Sürətlə uyğunlaşır və başqalarının da birlikdə irəliləməsinə kömək edirik.",
        culture_challenge_text: "Çətin vəziyyətlərdən öyrənir və irəli gedirik.",
        culture_urgency_text: "Vacib olanı təcilidən ayırır və gecikmədən hərəkət edirik.",
        culture_communication_title: "Kommunikasiya",
        culture_communication_text: "Şəffaf, faktlara əsaslanan və mahiyyət üzrə danışırıq.",
        culture_teamwork_title: "Komanda işi",
        culture_teamwork_text: "Ortaq məqsədlər üçün əməkdaşlıq edirik.",
        culture_growth_title: "Şəxsi inkişaf",
        culture_growth_text: "İnkişaf edir və işimizdə daha güclü olmağa çalışırıq.",
        culture_complexity_title: "Mürəkkəblik",
        culture_complexity_text: "STADA şəbəkəsinin təcrübəsindən istifadə edərək mürəkkəb olanı sadələşdiririk.",
        culture_action_eyebrow: "Mədəniyyət fəaliyyətdə",
        culture_action_heading: "Dəyərlər hər gün necə işləyir",
        culture_action_trust_title: "Hər qərarda etibarlılıq",
        culture_action_trust_text: "Keyfiyyət, standartlar və pasiyentə hörmət əsasımız olaraq qalır.",
        culture_action_drive_title: "Artıq mürəkkəblik olmadan təşəbbüs",
        culture_action_drive_text: "Daha az bürokratiya, daha çox məsuliyyət və praktik nəticələr.",
        culture_action_team_title: "Beynəlxalq səviyyədə vahid komanda",
        culture_action_team_text: "Yerli ekspertiza STADA-nın qlobal təcrübəsi ilə birləşir.",
        culture_next_eyebrow: "Tanışlığı davam etdirin",
        culture_next_heading: "Tarixin və insanların bu gün STADA-nı necə formalaşdırdığını öyrənin.",
        culture_history_cta: "STADA tarixi",
        nav_about: "Şirkət haqqında",
        nav_career: "Karyera",
        nav_categories: "Kateqoriyalar",
        nav_company: "Şirkət",
        nav_culture: "Mədəniyyət",
        nav_history: "Şirkətin tarixi",
        nav_news: "Xəbərlər və media",
        nav_products: "Məhsullar",
        nav_worldwide: "Filiallarımız",
        news_3_text: "Profilaktika, əlçatan məlumat və mütəxəssislərlə açıq ünsiyyət gündəlik sağlamlığın əsasını təşkil edir.",
        news_section_lead: "STADA xəbərləri, media materialları və məhsul yenilikləri bir bölmədə.",
        product_back: "Məhsullara qayıt",
        product_related_heading: "Oxşar məhsullar",
        product_related_intro: "Həcm, format və istifadə sahəsinə görə uyğun variantı seçin.",
        product_related_label: "Oxşar məhsullar",
        products_browse_catalog: "Kataloqa baxın",
        products_catalog_label: "STADA kataloqu",
        products_catalog_intro: "İstiqamət seçin və ya tərkib, üstünlüklər və haradan almaq barədə daha çox məlumat üçün məhsul kartını açın.",
        products_category_allergy: "Allergiya",
        products_category_cardio: "Kardio",
        products_category_cold: "Soyuqdəymə və tənəffüs",
        products_category_digestive: "Həzm",
        products_category_immunity: "İmmunitet",
        products_category_kids: "Uşaqlar üçün",
        products_category_respiratory: "Tənəffüs yolları",
        products_category_urology: "Urologiya",
        products_filter_all: "Bütün məhsullar",
        products_heading: "Məhsullarımız",
        products_metric_areas: "terapevtik istiqamət",
        products_metric_portfolio: "kataloqda məhsul",
        products_partners_heading: "Apteklərdə və onlayn servislərdə mövcuddur",
        products_partners_intro: "STADA məhsullarını Azərbaycanda tərəfdaş apteklərdə və rahat rəqəmsal servislərdə tapa bilərsiniz.",
        product_coldrex_name: "Coldrex",
        product_coldrex_page_desc: "Coldrex soyuqdəymə və qrip simptomlarını yüngülləşdirməyə kömək edən kombinə olunmuş preparatdır.",
        product_vitrum_immunaktiv_name: "Vitrum Immunaktiv",
        product_vitrum_immunaktiv_page_desc: "Vitrum Immunaktiv immuniteti dəstəkləmək üçün 13 vitamin, 8 mineral və beta-qlükan tərkibli vitamin-mineral kompleksidir.",
        product_vitrum_fizzy_name: "Vitrum Immunaktiv suda həll olan tabletlər",
        product_vitrum_fizzy_page_desc: "Böyüklərin immunitetini dəstəkləmək üçün vitaminlər, minerallar və beta-qlükan tərkibli suda həll olan vitamin-mineral kompleksi.",
        product_vitrum_energy_name: "Vitrum Energy",
        product_vitrum_energy_page_desc: "Böyüklərdə enerji, aktivlik və gündəlik tonusu dəstəkləmək üçün suda həll olan vitamin-mineral kompleksi.",
        product_vitrum_vitaminc_name: "Vitrum Vitamin C 900 mq",
        product_vitrum_vitaminc_page_desc: "İmmuniteti dəstəkləmək və C vitamininə ehtiyacı tamamlamaq üçün 900 mq C vitamini tərkibli suda həll olan tabletlər.",
        product_vitrum_magneb6_name: "Vitrum Maqnezium B6",
        product_vitrum_magneb6_page_desc: "Sinir sistemini, enerji mübadiləsini və gündəlik yüklənmələrə davamlılığı dəstəkləmək üçün maqnezium və B6 vitamini kompleksi.",
        product_magneb6kids_name: "Magne B6 Kids",
        product_magneb6kids_page_desc: "Magne B6 Kids 4 yaşdan yuxarı uşaqlar üçün maqnezium və B6 vitamini tərkibli çeynənən tabletlərdir. Komponentlər sinir sisteminin normal fəaliyyətini və enerji mübadiləsini dəstəkləməyə kömək edir.",
        product_vitrum_syrop_name: "Vitrum Kids Proimmun",
        product_vitrum_syrop_page_desc: "Uşaqların immunitetini dəstəkləmək üçün C vitamini, beta-qlükan və bitki komponentləri olan rahat formatlı məhsul.",
        product_enterogermina_name: "Enterogermina",
        product_enterogermina_page_desc: "Enterogermina disbakteriozun müalicəsi və profilaktikası üçün probiotikdir. Tərkibində bağırsaq mikroflorasını bərpa etməyə kömək edən Bacillus clausii sporları var.",
        product_enterogermina_forte_name: "Enterogermina Forte",
        product_enterogermina_forte_page_desc: "Enterogermina Forte disbakteriozun müalicəsi və profilaktikası üçün Bacillus clausii sporları olan probiotikdir. Suspenziya formatı təlimata uyğun gündə 1 dəfə rahat qəbul üçün nəzərdə tutulub.",
        product_enterogermina_capsules_name: "Enterogermina kapsulları",
        product_enterogermina_capsules_page_desc: "Enterogermina kapsulları disbakteriozun müalicəsi və profilaktikası üçün Bacillus clausii sporları olan probiotikdir. Kapsul formatı böyüklər və 6 yaşdan yuxarı uşaqlar üçün təlimata uyğun rahatdır.",
        product_noshpa_name: "NO-ŞPA",
        product_noshpa_page_desc: "NO-ŞPA 40 mq hamar əzələ spazmlarını yüngülləşdirmək üçün drotaverin hidroxlorid tərkibli tabletlərdir; təlimata uyğun istifadə olunur.",
        product_essentiale_name: "Essentiale",
        product_essentiale_page_desc: "Essentiale Forte N qaraciyər funksiyalarını dəstəkləmək üçün essensial fosfolipidlər tərkibli kapsullardır; təlimata və mütəxəssis tövsiyəsinə uyğun istifadə olunur.",
        product_aqualor_name: "Aqualor",
        product_aqualor_page_desc: "Aqualor Extra Forte güclü burun axması zamanı burun boşluğuna qulluq üçün 125 ml steril dəniz suyu məhluludur; təlimata uyğun istifadə olunur.",
        product_aqualor_forte_name: "Aqualor Active Forte",
        product_aqualor_forte_page_desc: "Aqualor Active Forte burun boşluğuna qulluq və yuyulma üçün CO2 ilə 150 ml dəniz suyu spreyidir; təlimata uyğun istifadə olunur.",
        product_aqualor_baby_name: "Aqualor Baby",
        product_aqualor_baby_page_desc: "Aqualor Baby körpənin burnuna gündəlik qulluq üçün 15 ml dəniz suyu damcılarıdır; təlimata uyğun istifadə olunur.",
        product_aqualor_gorlo_name: "Aqualor Throat",
        product_aqualor_gorlo_page_desc: "Aqualor Throat boğazın suvarılması və yuyulması üçün 50 ml steril hipertonik dəniz suyu məhluludur; təlimata uyğun istifadə olunur.",
        product_aqualor_soft_name: "Aqualor Soft",
        product_aqualor_soft_page_desc: "Aqualor Soft burun boşluğunun suvarılması və yuyulması üçün duş formatında 125 ml steril izotonik dəniz suyu məhluludur; təlimata uyğun istifadə olunur.",
        product_aqualor_soft_mini_name: "Aqualor Soft mini",
        product_aqualor_soft_mini_page_desc: "Aqualor Soft mini burun boşluğunun suvarılması və yuyulması üçün duş formatında 50 ml steril izotonik dəniz suyu məhluludur; təlimata uyğun istifadə olunur.",
        product_sinulan_duo_name: "Sinulan Duo",
        product_sinulan_duo_page_desc: "Sinulan Duo soyuqdəymə zamanı nəfəsalmanı yüngülləşdirmək və tənəffüs yollarının sağlamlığını dəstəkləmək üçün bitki ekstraktları kompleksidir.",
        product_snup_name: "Snup",
        product_snup_page_desc: "Snup burun tutulması zamanı burundan nəfəsalmanı yüngülləşdirmək üçün ksilometazolin və dəniz suyu tərkibli dozalanmış burun spreyidir.",
        product_zodak_name: "Zodak",
        product_zodak_page_desc: "Allergik rinit və övrə simptomlarını yüngülləşdirmək üçün setirizin tərkibli antihistamin preparat.",
        product_zodak_drops_name: "Zodak damcıları",
        product_zodak_drops_page_desc: "Böyüklər və uşaqlarda allergiya simptomlarını təlimata uyğun yüngülləşdirmək üçün setirizin tərkibli damcılar.",
        product_edarbi_klo_name: "Edarbi Klo",
        product_edarbi_klo_page_desc: "Edarbi Klo arterial təzyiqi azaltmaq üçün azilsartan medoksomil və xlortalidon əsasında kombinə olunmuş preparatdır.",
        product_vitaprost_name: "Vitaprost",
        product_vitaprost_page_desc: "Mütəxəssis təyinatına və təlimata uyğun istifadə üçün tablet formasında uroloji preparat.",
        product_cardiomagnil_name: "Cardiomagnil",
        product_cardiomagnil_page_desc: "Cardiomagnil 150 mq həkim təyinatı ilə infarkt və trombozun profilaktikası üçün asetilsalisil turşusu və maqnezium hidroksid tərkibli preparatdır.",
        site_name: "STADA Azerbaijan",
        where_to_buy_heading: "Haradan almaq olar",
        worldwide_country_label: "Ölkələrə baxış",
        worldwide_country_search: "Ölkə axtarın",
        worldwide_eyebrow: "STADA-nın qlobal iştirakı",
        worldwide_globe_fallback_title: "Qlobal xəritə",
        worldwide_globe_fallback_text: "Ölkələrə baxışdan STADA bazarını seçin.",
        worldwide_globe_hint_regions: "Regional ofislər",
        worldwide_globe_hint_markets: "STADA-nın rəsmi bazarları",
        worldwide_globe_topline: "COBE WebGL qlobusu",
        worldwide_heading: "Filiallarımız",
        worldwide_page_title: "STADA - Filiallarımız",
        worldwide_subtitle: "Qlobal iştirak. Yerli təcrübə.",
      },
    },
    productCatalog: {
      az: {
        "kamistad-baby": {
          name: "Kamistad Baby",
          shortDescription: "Uşaqlarda diş çıxarma zamanı diş ətinə təlimata uyğun çəkilmək üçün 20 q gel.",
          therapeuticArea: "Uşaqlar üçün",
          imageAlt: "Kamistad Baby",
        },
        "no-shpa": {
          imageAlt: "NO-ŞPA",
        },
        "no-shpa-forte": {
          name: "NO-ŞPA Forte",
          shortDescription: "Hamar əzələ spazmlarını yüngülləşdirmək üçün drotaverin tərkibli 80 mq tabletlər; təlimata uyğun istifadə olunur.",
          therapeuticArea: "Həzm",
          imageAlt: "NO-ŞPA Forte",
        },
        essentiale: {
          imageAlt: "Essentiale",
        },
        femilex: {
          name: "Femilex",
          shortDescription: "Mikrofloranın və pH balansının normallaşdırılması üçün 100 mq süd turşusu tərkibli vaginal suppozitoriyalar.",
          therapeuticArea: "Ginekologiya",
          imageAlt: "Femilex",
        },
        nizoral: {
          name: "Nizoral",
          shortDescription: "Xaricə istifadə üçün 2% ketokonazol tərkibli krem, 15 q.",
          therapeuticArea: "Dermatologiya",
          imageAlt: "Nizoral",
        },
        "nizoral-shampoo": {
          name: "Nizoral şampun",
          shortDescription: "Təlimata uyğun istifadə üçün 2% ketokonazol tərkibli müalicəvi şampun, 60 ml.",
          therapeuticArea: "Dermatologiya",
          imageAlt: "Nizoral şampun",
        },
        "psilo-balsam": {
          name: "Psilo-balzam",
          shortDescription: "Təlimata uyğun xaricə istifadə üçün difenhidramin hidroxlorid tərkibli 1% gel, 20 q.",
          therapeuticArea: "Dermatologiya",
          imageAlt: "Psilo-balzam",
        },
        gecsikon: {
          name: "Geksikon",
          shortDescription: "Yerli istifadə üçün xlorheksidin tərkibli 16 mq vaginal suppozitoriyalar.",
          therapeuticArea: "Ginekologiya",
          imageAlt: "Geksikon",
        },
        aqualor: { imageAlt: "Aqualor" },
        "aqualor-forte": { imageAlt: "Aqualor Active Forte" },
        "aqualor-baby": { imageAlt: "Aqualor Baby" },
        "aqualor-gorlo": { imageAlt: "Aqualor Throat sprey" },
        "aqualor-soft": { imageAlt: "Aqualor Soft" },
        "aqualor-soft-mini": { imageAlt: "Aqualor Soft mini" },
        "edarbi-klo": {
          therapeuticArea: "Kardio",
        },
        vitaprost: {
          therapeuticArea: "Urologiya",
        },
        cardiomagnil: {
          imageAlt: "Cardiomagnil",
          therapeuticArea: "Kardio",
        },
        "klopidogrel-teva": {
          name: "Clopidogrel-Teva",
          shortDescription: "Həkim təyinatı ilə istifadə üçün plyonka örtüklü 75 mq tabletlər, №28.",
          therapeuticArea: "Kardio",
          imageAlt: "Clopidogrel-Teva",
        },
      },
    },
    domText: {
      ru: {
        worldwide_text_001: "Azerbaijan",
      },
      az: {
        worldwide_text_001: "Azərbaycan",
      },
    },
  },
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadConfig() {
  const config = readJson(configPath);
  if (!config.countries || typeof config.countries !== "object") {
    throw Object.assign(new Error("Backend country config must include a countries object."), {
      statusCode: 500,
      code: "INVALID_CONFIG",
    });
  }
  return config;
}

function loadContentSource(config) {
  const sourcePath = resolveBackendPath(config.contentSourcePath || "data/content-source.json");
  if (!fs.existsSync(sourcePath)) {
    return {
      version: 1,
      pages: {},
    };
  }

  const source = readJson(sourcePath);
  return {
    version: source.version || 1,
    pages: source.pages && typeof source.pages === "object" ? source.pages : {},
  };
}

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[_.\s]+/g, "-")
    .replace(/\/+$/, "");
}

function unique(values) {
  return [...new Set(values.filter(value => value !== null && value !== undefined && value !== ""))];
}

function listCountries() {
  const config = loadConfig();
  return Object.values(config.countries).map(country => ({
    id: country.id,
    name: country.name,
    siteName: country.siteName,
    domain: country.domain,
    siteUrl: country.siteUrl,
    aliases: country.aliases || [],
    defaultLanguage: country.defaultLanguage,
    supportedLanguages: country.supportedLanguages || [],
  }));
}

function findCountryConfig(config, countryInput) {
  const requested = normalizeSlug(countryInput || config.defaultCountry);
  const countries = Object.values(config.countries);
  const country = countries.find(candidate => {
    const matchValues = unique([
      candidate.id,
      candidate.name,
      candidate.siteName,
      candidate.domain,
      ...(candidate.aliases || []),
    ]).map(normalizeSlug);
    return matchValues.includes(requested);
  });

  if (!country) {
    throw Object.assign(new Error(`Country "${countryInput}" is not configured for this backend yet.`), {
      statusCode: 404,
      code: "COUNTRY_NOT_CONFIGURED",
      knownCountries: countries.map(candidate => candidate.id),
    });
  }

  return country;
}

function resolveBackendPath(filePath) {
  if (!filePath) return "";
  return path.isAbsolute(filePath) ? filePath : path.resolve(backendRoot, filePath);
}

function normalizePagePath(pageInput) {
  const withoutHash = String(pageInput || "")
    .split("#")[0]
    .split("?")[0]
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .trim();

  if (!withoutHash || withoutHash === "." || withoutHash === "index") return "index.html";
  if (withoutHash.endsWith("/")) return `${withoutHash}index.html`;
  return path.posix.extname(withoutHash) ? withoutHash : `${withoutHash}.html`;
}

function validateNormalizedPagePath(pagePath) {
  if (pagePath.split("/").includes("..")) {
    throw Object.assign(new Error("Page path cannot include parent directory segments."), {
      statusCode: 400,
      code: "INVALID_PAGE_PATH",
    });
  }

  if (path.extname(pagePath).toLowerCase() !== ".html") {
    throw Object.assign(new Error("Only HTML pages can be loaded."), {
      statusCode: 400,
      code: "INVALID_PAGE_PATH",
    });
  }
}

function resolveHtmlPath(homepageConfig, pageInput) {
  const homepagePath = resolveBackendPath(homepageConfig.htmlPath);
  const siteRoot = path.dirname(homepagePath);
  const pagePath = normalizePagePath(pageInput);
  validateNormalizedPagePath(pagePath);

  const resolvedPath = path.resolve(siteRoot, pagePath);
  const relativePath = path.relative(siteRoot, resolvedPath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw Object.assign(new Error("Page path is outside the configured site root."), {
      statusCode: 400,
      code: "INVALID_PAGE_PATH",
    });
  }

  if (!fs.existsSync(resolvedPath)) {
    throw Object.assign(new Error(`Page "${pagePath}" was not found.`), {
      statusCode: 404,
      code: "PAGE_NOT_FOUND",
      page: pagePath,
    });
  }

  return {
    htmlPath: resolvedPath,
    pagePath: relativePath.replace(/\\/g, "/"),
  };
}

function extractBalancedLiteral(source, openIndex, openChar, closeChar, label) {
  let depth = 0;
  let quote = "";
  let escaping = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escaping) {
        escaping = false;
        continue;
      }
      if (char === "\\") {
        escaping = true;
        continue;
      }
      if (char === quote) quote = "";
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex, index + 1);
    }
  }

  throw new Error(`Could not find closing "${closeChar}" for "${label}".`);
}

function extractJsLiteral(source, name, openChar, closeChar) {
  const assignmentPattern = new RegExp(`(?:export\\s+)?(?:const|let|var)\\s+${name}\\s*=`);
  const assignmentMatch = assignmentPattern.exec(source);
  if (!assignmentMatch) {
    throw new Error(`Could not find JavaScript literal "${name}".`);
  }

  const openIndex = source.indexOf(openChar, assignmentMatch.index + assignmentMatch[0].length);
  if (openIndex === -1) {
    throw new Error(`Could not find opening "${openChar}" for "${name}".`);
  }

  return extractBalancedLiteral(source, openIndex, openChar, closeChar, name);
}

function extractFunctionDeclaration(source, name) {
  const functionPattern = new RegExp(`function\\s+${name}\\s*\\(`);
  const functionMatch = functionPattern.exec(source);
  if (!functionMatch) {
    throw new Error(`Could not find JavaScript function "${name}".`);
  }

  const openIndex = source.indexOf("{", functionMatch.index);
  if (openIndex === -1) {
    throw new Error(`Could not find opening "{" for "${name}".`);
  }

  return source.slice(functionMatch.index, openIndex) + extractBalancedLiteral(source, openIndex, "{", "}", name);
}

function evaluateLiteral(literal, label) {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`globalThis.__value = (${literal});`, sandbox, {
    timeout: 1000,
    displayErrors: true,
    filename: `${label}.literal.js`,
  });
  return sandbox.__value;
}

function loadTranslations(scriptPath) {
  const source = fs.readFileSync(scriptPath, "utf8");
  const literal = extractJsLiteral(source, "translations", "{", "}");
  const translations = evaluateLiteral(literal, "translations");
  applyTranslationMutations(source, translations);
  return translations;
}

function loadProductFallbackTools(scriptPath) {
  const source = fs.readFileSync(scriptPath, "utf8");
  let productFallbacksLiteral;
  let productCopyOverridesLiteral = "{ ru: {}, kz: {} }";
  let getProductFallbackFunction;

  try {
    productFallbacksLiteral = extractJsLiteral(source, "productFallbacks", "{", "}");
    getProductFallbackFunction = extractFunctionDeclaration(source, "getProductFallback");
  } catch (error) {
    return {
      productFallbacks: {},
      getProductFallback: () => "",
    };
  }

  try {
    productCopyOverridesLiteral = extractJsLiteral(source, "productCopyOverrides", "{", "}");
  } catch (error) {
    // Product copy overrides are optional for older frontend bundles.
  }

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(
    `
      const productFallbacks = (${productFallbacksLiteral});
      const productCopyOverrides = (${productCopyOverridesLiteral});
      if (productCopyOverrides.ru) Object.assign(productFallbacks.ru ||= {}, productCopyOverrides.ru);
      if (productCopyOverrides.kz) Object.assign(productFallbacks.kz ||= {}, productCopyOverrides.kz);
      ${getProductFallbackFunction}
      globalThis.__productFallbacks = productFallbacks;
      globalThis.__getProductFallback = getProductFallback;
    `,
    sandbox,
    {
      timeout: 1000,
      displayErrors: true,
      filename: "product-fallbacks.literal.js",
    }
  );

  applyProductFallbackMutations(source, sandbox.__productFallbacks || {});

  return {
    productFallbacks: sandbox.__productFallbacks || {},
    getProductFallback: typeof sandbox.__getProductFallback === "function" ? sandbox.__getProductFallback : () => "",
  };
}

function applyProductFallbackMutations(source, productFallbacks) {
  const objectAssignPattern = /Object\.assign\s*\(\s*productFallbacks\.([a-zA-Z0-9_$]+)\s*,\s*{/g;
  let match;

  while ((match = objectAssignPattern.exec(source)) !== null) {
    const openIndex = source.lastIndexOf("{", objectAssignPattern.lastIndex - 1);
    if (openIndex === -1) continue;
    const objectLiteral = extractBalancedLiteral(
      source,
      openIndex,
      "{",
      "}",
      `Object.assign(productFallbacks.${match[1]})`
    );
    productFallbacks[match[1]] ||= {};
    Object.assign(
      productFallbacks[match[1]],
      evaluateLiteral(objectLiteral, `productFallbacks.${match[1]}`)
    );
    objectAssignPattern.lastIndex = openIndex + objectLiteral.length;
  }
}

function applyTranslationMutations(source, translations) {
  const mutations = [];
  const directAssignmentPattern = /translations\.([a-zA-Z0-9_$]+)\.([a-zA-Z0-9_$]+)\s*=\s*([^;]+);/g;
  let match;

  while ((match = directAssignmentPattern.exec(source)) !== null) {
    mutations.push({
      index: match.index,
      type: "direct",
      language: match[1],
      key: match[2],
      valueLiteral: match[3],
    });
  }

  const objectAssignPattern = /Object\.assign\s*\(\s*translations\.([a-zA-Z0-9_$]+)\s*,/g;
  while ((match = objectAssignPattern.exec(source)) !== null) {
    const openIndex = source.indexOf("{", objectAssignPattern.lastIndex);
    if (openIndex === -1) continue;
    const objectLiteral = extractBalancedLiteral(
      source,
      openIndex,
      "{",
      "}",
      `Object.assign(translations.${match[1]})`
    );
    mutations.push({
      index: match.index,
      type: "assign",
      language: match[1],
      objectLiteral,
    });
    objectAssignPattern.lastIndex = openIndex + objectLiteral.length;
  }

  mutations.sort((left, right) => left.index - right.index);

  for (const mutation of mutations) {
    translations[mutation.language] ||= {};
    if (mutation.type === "direct") {
      translations[mutation.language][mutation.key] = evaluateLiteral(
        mutation.valueLiteral,
        `translations.${mutation.language}.${mutation.key}`
      );
    } else {
      Object.assign(
        translations[mutation.language],
        evaluateLiteral(mutation.objectLiteral, `translations.${mutation.language}`)
      );
    }
  }
}

function loadWorldwideCountries(countriesDataPath) {
  if (!countriesDataPath || !fs.existsSync(countriesDataPath)) return [];
  const source = fs.readFileSync(countriesDataPath, "utf8");
  if (countriesDataPath.toLowerCase().endsWith(".json")) {
    const parsed = JSON.parse(source);
    return Array.isArray(parsed) ? parsed : parsed.countries || [];
  }
  const literal = extractJsLiteral(source, "countriesData", "[", "]");
  return evaluateLiteral(literal, "countriesData");
}

function decodeHtml(value) {
  const namedEntities = {
    amp: "&",
    gt: ">",
    lt: "<",
    quot: "\"",
    apos: "'",
    nbsp: " ",
    copy: "\u00a9",
    lsaquo: "\u2039",
    rsaquo: "\u203a",
  };

  return String(value || "")
    .replace(/&(#x[a-f0-9]+|#\d+|[a-z]+);/gi, (match, entity) => {
      const lower = entity.toLowerCase();
      if (lower.startsWith("#x")) return String.fromCodePoint(parseInt(lower.slice(2), 16));
      if (lower.startsWith("#")) return String.fromCodePoint(parseInt(lower.slice(1), 10));
      return Object.prototype.hasOwnProperty.call(namedEntities, lower) ? namedEntities[lower] : match;
    })
    .replace(/\u00a0/g, " ");
}

function normalizeText(value) {
  return decodeHtml(value).replace(/\s+/g, " ").trim();
}

function parseAttributes(attributeSource) {
  const attributes = {};
  const attributePattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = attributePattern.exec(attributeSource)) !== null) {
    attributes[match[1]] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

function extractPageTitle(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? normalizeText(match[1]) : "";
}

function extractTranslationKeys(html) {
  const keys = [];
  const keyPattern = /data-(?:i18n-key|caption-key|title-key|lead-key)\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;
  let match;
  while ((match = keyPattern.exec(html)) !== null) {
    keys.push(match[1] || match[2]);
  }
  return unique(keys);
}

function extractStaticTexts(html) {
  const texts = [];
  const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, "");
  const textNodePattern = />\s*([^<>]+?)\s*</g;
  let match;

  while ((match = textNodePattern.exec(cleanHtml)) !== null) {
    const text = normalizeText(match[1]);
    if (!text || text === "/" || text === "--") continue;
    texts.push(text);
  }

  return unique(texts);
}

function extractBackendTextItems(html) {
  const items = [];
  const textPattern = /<([a-z][a-z0-9:-]*)\b([^>]*)\bdata-backend-text-id\s*=\s*(?:"([^"]+)"|'([^']+)')([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match;

  while ((match = textPattern.exec(html)) !== null) {
    const value = normalizeText(match[6]);
    if (!value) continue;
    items.push({
      id: match[3] || match[4],
      tag: match[1].toLowerCase(),
      value,
    });
  }

  return items;
}

function makeAssetUrl(src, assetsBaseUrl) {
  if (!src) return "";
  if (/^(?:https?:)?\/\//i.test(src) || /^data:/i.test(src)) return src;
  if (!assetsBaseUrl) return src;

  if (/^https?:\/\//i.test(assetsBaseUrl)) {
    return new URL(src.replace(/^\/+/, ""), assetsBaseUrl.endsWith("/") ? assetsBaseUrl : `${assetsBaseUrl}/`).href;
  }

  const base = assetsBaseUrl.endsWith("/") ? assetsBaseUrl : `${assetsBaseUrl}/`;
  return `${base}${src.replace(/^\/+/, "")}`;
}

function extractBackendImages(html, assetsBaseUrl) {
  const images = [];
  const imagePattern = /<img\b([^>]*)>/gi;
  let match;

  while ((match = imagePattern.exec(html)) !== null) {
    const attrs = parseAttributes(match[1]);
    const id = attrs["data-backend-image-id"];
    if (!id) continue;
    const src = attrs["data-backend-src"] || attrs.src;
    if (!src) continue;
    images.push({
      id,
      src,
      url: makeAssetUrl(src, assetsBaseUrl),
      alt: attrs.alt || "",
      loading: attrs.loading || "",
      srcset: attrs.srcset || "",
      sizes: attrs.sizes || "",
    });
  }

  return images;
}

function extractImages(html, sectionId, assetsBaseUrl) {
  const images = [];
  const imagePattern = /<img\b([^>]*)>/gi;
  let match;

  while ((match = imagePattern.exec(html)) !== null) {
    const attrs = parseAttributes(match[1]);
    const src = attrs["data-backend-src"] || attrs.src;
    if (!src) continue;
    images.push({
      id: attrs["data-backend-image-id"] || "",
      section: sectionId,
      src,
      url: makeAssetUrl(src, assetsBaseUrl),
      alt: attrs.alt || "",
      loading: attrs.loading || "",
    });
  }

  return images;
}

function extractBlock(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>[\\s\\S]*?<\\/${tagName}>`, "i");
  const match = html.match(pattern);
  return match ? match[0] : "";
}

function extractSections(html) {
  const sections = [];
  const nav = extractBlock(html, "nav");
  if (nav) sections.push({ id: "navigation", label: "Navigation", html: nav });

  const hero = extractBlock(html, "header");
  if (hero) sections.push({ id: "hero", label: "Hero", html: hero });

  const sectionPattern = /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;
  let match;
  while ((match = sectionPattern.exec(html)) !== null) {
    const attributes = parseAttributes(match[1]);
    const id = attributes.id || attributes.class || `section-${sections.length + 1}`;
    sections.push({
      id: normalizeSlug(id),
      label: attributes.id || attributes.class || "Section",
      html: match[0],
    });
  }

  const footer = extractBlock(html, "footer");
  if (footer) sections.push({ id: "footer", label: "Footer", html: footer });

  return sections;
}

function isOptionalEmptyProductKey(key) {
  return /^product_[a-z0-9_]+_benefit\d+$/i.test(key);
}

function languageFallbackOrder(language, fallbackLanguage) {
  const requested = String(language || "").trim().toLowerCase();
  const regionalFallbacks = requested === "ge" ? ["en"] : requested === "en" ? ["ge"] : [];
  if (requested === "kg") return unique([requested, fallbackLanguage, "ru", "en"]);
  if (requested === "az") return unique([requested, fallbackLanguage, "ru", "en"]);
  if (requested === "ge" || requested === "en") return unique([requested, ...regionalFallbacks, fallbackLanguage, "ru", "kz", "kg", "en"]);
  return unique([requested, ...regionalFallbacks, fallbackLanguage, "ru", "kz", "en"]);
}

function applyReplacementRules(value, rules = []) {
  return rules.reduce((text, [from, to]) => {
    return text.split(from).join(to);
  }, String(value ?? ""));
}

function countryContentProfile(countryId) {
  return countryContentProfiles[String(countryId || "").trim().toLowerCase()] || null;
}

function countryProfileLanguageBlock(profile, blockName, language) {
  const block = profile?.[blockName] || {};
  return {
    ...(block.default || {}),
    ...(block[language] || {}),
  };
}

function applyCountrySpecificContent(payload, countryConfig) {
  const profile = countryContentProfile(countryConfig.id);
  if (!profile || !payload?.content) return payload;

  const language = String(payload.language || countryConfig.defaultLanguage || "").trim().toLowerCase();
  const replacements = profile.replacements?.[language] || profile.replacements?.default || [];
  const textOverrides = { ...countryProfileLanguageBlock(profile, "text", language) };
  const domTextOverrides = countryProfileLanguageBlock(profile, "domText", language);
  const productCatalogOverrides = countryProfileLanguageBlock(profile, "productCatalog", language);
  const pageTitle = profile.pageTitles?.[language]?.[payload.page?.path];

  for (const product of payload.content.productCatalog || []) {
    const productOverride = productCatalogOverrides[product.id] || {};
    if (product.nameKey && productOverride.name) textOverrides[product.nameKey] = productOverride.name;
    if (product.descriptionKey && productOverride.shortDescription) {
      textOverrides[product.descriptionKey] = productOverride.shortDescription;
    }
    if (product.categoryKey && productOverride.therapeuticArea) {
      textOverrides[product.categoryKey] = productOverride.therapeuticArea;
    }
  }

  const resolveProfileText = (key, value) => {
    if (Object.prototype.hasOwnProperty.call(textOverrides, key)) {
      return textOverrides[key];
    }
    return applyReplacementRules(value, replacements);
  };

  payload.content.pageTitle = pageTitle || applyReplacementRules(payload.content.pageTitle || "", replacements);

  for (const [key, value] of Object.entries(payload.content.text || {})) {
    payload.content.text[key] = resolveProfileText(key, value);
  }

  for (const section of payload.content.sections || []) {
    for (const item of section.translatedTexts || []) {
      if (!item?.key) continue;
      item.value = resolveProfileText(item.key, item.value);
    }
  }

  const productImageAltOverrides = new Map();

  for (const product of payload.content.productCatalog || []) {
    const productOverride = productCatalogOverrides[product.id] || {};
    const nameOverride = productOverride.name || (product.nameKey ? textOverrides[product.nameKey] : "");
    const descriptionOverride = productOverride.shortDescription || (product.descriptionKey ? textOverrides[product.descriptionKey] : "");
    const categoryOverride = productOverride.therapeuticArea || (product.categoryKey ? textOverrides[product.categoryKey] : "");

    if (nameOverride) {
      product.name = nameOverride;
    } else if (product.nameKey && payload.content.text?.[product.nameKey]) {
      product.name = payload.content.text[product.nameKey];
    } else {
      product.name = applyReplacementRules(product.name || "", replacements);
    }

    if (descriptionOverride) {
      product.shortDescription = descriptionOverride;
    } else if (product.descriptionKey && payload.content.text?.[product.descriptionKey]) {
      product.shortDescription = payload.content.text[product.descriptionKey];
    } else {
      product.shortDescription = applyReplacementRules(product.shortDescription || "", replacements);
    }

    if (categoryOverride) {
      product.therapeuticArea = categoryOverride;
    } else if (product.categoryKey && payload.content.text?.[product.categoryKey]) {
      product.therapeuticArea = payload.content.text[product.categoryKey];
    } else {
      product.therapeuticArea = applyReplacementRules(product.therapeuticArea || "", replacements);
    }

    if (product.image && productOverride.imageAlt) {
      product.image.alt = productOverride.imageAlt;
    }
    if (product.image?.id && (productOverride.imageAlt || nameOverride || product.name)) {
      productImageAltOverrides.set(product.image.id, productOverride.imageAlt || nameOverride || product.name);
    }
  }

  const applyProfileImageAlt = image => {
    if (!image || typeof image !== "object") return;
    const override = productImageAltOverrides.get(String(image.id || ""));
    if (override) {
      image.alt = override;
    } else if (typeof image.alt === "string") {
      image.alt = applyReplacementRules(image.alt, replacements);
    }
  };
  (payload.content.photos || []).forEach(applyProfileImageAlt);
  (payload.content.dom?.images || []).forEach(applyProfileImageAlt);
  for (const section of payload.content.sections || []) {
    (section.photos || []).forEach(applyProfileImageAlt);
  }

  payload.content.dom.text = (payload.content.dom.text || []).map(item => {
    const id = String(item.id || "");
    const value = Object.prototype.hasOwnProperty.call(domTextOverrides, id)
      ? domTextOverrides[id]
      : applyReplacementRules(item.value || "", replacements);
    return {
      ...item,
      value,
    };
  });

  return payload;
}

function resolveTranslation(translations, productFallbackTools, language, fallbackLanguage, key) {
  const languageOrder = languageFallbackOrder(language, fallbackLanguage);
  for (const candidateLanguage of languageOrder) {
    const value = translations[candidateLanguage]?.[key];
    if (value) {
      return {
        key,
        value,
        language: candidateLanguage,
      };
    }

    const fallbackValue = productFallbackTools.getProductFallback(candidateLanguage, key);
    if (fallbackValue || isOptionalEmptyProductKey(key)) {
      return {
        key,
        value: fallbackValue,
        language: candidateLanguage,
        source: "productFallback",
      };
    }
  }

  return {
    key,
    value: null,
    language: null,
  };
}

function chooseLanguage(countryConfig, translations, languageInput) {
  const supportedLanguages = countryConfig.supportedLanguages?.length
    ? countryConfig.supportedLanguages
    : Object.keys(translations);
  const requestedLanguage = String(languageInput || countryConfig.defaultLanguage || "").trim().toLowerCase();

  if (requestedLanguage && supportedLanguages.includes(requestedLanguage)) return requestedLanguage;
  if (countryConfig.defaultLanguage && supportedLanguages.includes(countryConfig.defaultLanguage)) {
    return countryConfig.defaultLanguage;
  }
  return supportedLanguages[0] || "ru";
}

function findWorldwideCountry(countryConfig, worldwideCountries) {
  const targetValues = unique([countryConfig.id, countryConfig.name, ...(countryConfig.aliases || [])]).map(normalizeSlug);
  return worldwideCountries.find(country => {
    const matchValues = unique([country.id, country.name, country.website]).map(normalizeSlug);
    return matchValues.some(value => targetValues.includes(value));
  }) || null;
}

function buildSectionPayload(section, translations, productFallbackTools, language, fallbackLanguage, assetsBaseUrl) {
  const translatedTexts = extractTranslationKeys(section.html)
    .map(key => resolveTranslation(translations, productFallbackTools, language, fallbackLanguage, key));

  return {
    id: section.id,
    label: section.label,
    translatedTexts,
    staticTexts: extractStaticTexts(section.html),
    photos: extractImages(section.html, section.id, assetsBaseUrl),
  };
}

function chooseContentSourceLanguage(countryConfig, pageText, languageInput) {
  const supportedLanguages = countryConfig.supportedLanguages?.length
    ? countryConfig.supportedLanguages
    : Object.keys(pageText || {});
  const requestedLanguage = String(languageInput || countryConfig.defaultLanguage || "").trim().toLowerCase();

  if (requestedLanguage && supportedLanguages.includes(requestedLanguage)) return requestedLanguage;
  if (countryConfig.defaultLanguage && supportedLanguages.includes(countryConfig.defaultLanguage)) {
    return countryConfig.defaultLanguage;
  }
  return supportedLanguages[0] || "ru";
}

function resolveContentSourceText(pageSource, language, fallbackLanguage, key) {
  const languageOrder = languageFallbackOrder(language, fallbackLanguage);
  for (const candidateLanguage of languageOrder) {
    const value = pageSource.text?.[candidateLanguage]?.[key];
    if (value !== null && value !== undefined && value !== "") {
      return {
        key,
        value,
        language: candidateLanguage,
        source: "contentSource",
      };
    }
  }

  return {
    key,
    value: null,
    language: null,
    source: "contentSource",
  };
}

function resolveContentSourceDomText(pageSource, language, fallbackLanguage, item) {
  const id = String(item?.id || "");
  for (const candidateLanguage of languageFallbackOrder(language, fallbackLanguage)) {
    const value = pageSource.domTextTranslations?.[candidateLanguage]?.[id];
    if (value !== null && value !== undefined && value !== "") {
      return String(value);
    }
  }
  return String(item?.value || "");
}

function normalizeContentSourceImage(image, sectionId, assetsBaseUrl) {
  const src = String(image?.src || "");
  return {
    id: String(image?.id || ""),
    section: sectionId || "",
    src,
    url: makeAssetUrl(src, assetsBaseUrl),
    alt: String(image?.alt || ""),
    loading: String(image?.loading || ""),
    srcset: String(image?.srcset || ""),
    sizes: String(image?.sizes || ""),
  };
}

function normalizeHomepageRelativePath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^(\.\/)+/, "")
    .replace(/^(\.\.\/)+/, "");
}

function normalizeProductIdFromHref(href) {
  return normalizeHomepageRelativePath(href)
    .replace(/^products\//, "")
    .replace(/\.html(?:[?#].*)?$/i, "")
    .replace(/\/index$/i, "")
    .trim();
}

function stripHtml(value) {
  return normalizeText(String(value || "").replace(/<[^>]*>/g, " "));
}

function getClassList(attributes) {
  return String(attributes.class || "").split(/\s+/).filter(Boolean);
}

function findElementByClass(html, tagName, className) {
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const attributes = parseAttributes(match[1]);
    if (getClassList(attributes).includes(className)) {
      return {
        attributes,
        html: match[0],
        innerHtml: match[2],
        text: stripHtml(match[2]),
      };
    }
  }
  return null;
}

function findImage(html) {
  const match = html.match(/<img\b([^>]*)>/i);
  return match ? parseAttributes(match[1]) : {};
}

function resolveCatalogText({ key, text }, translations, productFallbackTools, language, fallbackLanguage) {
  if (key) {
    const translated = resolveTranslation(translations, productFallbackTools, language, fallbackLanguage, key);
    if (translated.value) return translated.value;
  }
  return text || "";
}

function extractCardAccent(style) {
  const match = String(style || "").match(/--card-accent\s*:\s*([^;]+)/i);
  return match ? match[1].trim() : "";
}

function normalizeProductIds(value) {
  const ids = Array.isArray(value) ? value : String(value || "").split(",");
  return unique(ids.map(item => String(item || "").trim()).filter(Boolean));
}

function syncHomeProducts(payload) {
  const catalog = payload.content?.productCatalog || [];
  const catalogById = new Map(catalog.map(product => [product.id, product]));
  const requestedIds = normalizeProductIds(payload.content?.settings?.homeProducts);
  const fallbackIds = normalizeProductIds([
    ...defaultHomeProductIds,
    ...catalog.map(product => product.id),
  ]);
  const selectedIds = [
    ...requestedIds,
    ...fallbackIds.filter(id => catalogById.has(id) && !requestedIds.includes(id)),
  ].slice(0, 4);

  payload.content.settings ||= {};
  payload.content.settings.homeProducts = selectedIds;
  payload.content.homeProducts = selectedIds.map(id => catalogById.get(id)).filter(Boolean);
}

function attachProductCatalog(payload) {
  payload.content.productCatalog = [];
  syncHomeProducts(payload);
}

function buildContentSourcePayload({
  countryConfig,
  pagePath,
  pageSource,
  languageInput,
  assetsBaseUrl,
  worldwideCountry,
}) {
  const language = chooseContentSourceLanguage(countryConfig, pageSource.text, languageInput);
  const fallbackLanguage = countryConfig.defaultLanguage || language;
  const imagesById = new Map(
    (pageSource.images || []).map(image => [image.id, image])
  );
  const sections = (pageSource.sections || []).map(section => {
    const translatedTexts = (section.translatedTextKeys || [])
      .map(key => resolveContentSourceText(pageSource, language, fallbackLanguage, key));
    const photos = (section.imageIds || [])
      .map(id => imagesById.get(id))
      .filter(Boolean)
      .map(image => normalizeContentSourceImage(image, section.id, assetsBaseUrl));

    return {
      id: section.id,
      label: section.label || section.id,
      translatedTexts,
      staticTexts: [],
      photos,
    };
  });
  const allKeys = unique([
    ...sections.flatMap(section => section.translatedTexts.map(item => item.key)),
    ...languageFallbackOrder(language, fallbackLanguage).flatMap(candidateLanguage => Object.keys(pageSource.text?.[candidateLanguage] || {})),
  ]);
  const text = Object.fromEntries(
    allKeys.map(key => {
      const translated = resolveContentSourceText(pageSource, language, fallbackLanguage, key);
      return [key, translated.value];
    })
  );

  return {
    country: {
      id: countryConfig.id,
      name: countryConfig.name,
      siteName: countryConfig.siteName,
      domain: countryConfig.domain,
      siteUrl: countryConfig.siteUrl,
      defaultLanguage: countryConfig.defaultLanguage,
      supportedLanguages: countryConfig.supportedLanguages || [],
      worldwide: worldwideCountry || null,
    },
    language,
    requestedLanguage: languageInput || null,
    page: {
      path: pagePath,
    },
    content: {
      pageTitle: languageFallbackOrder(language, fallbackLanguage)
        .map(candidateLanguage => pageSource.title?.[candidateLanguage])
        .find(Boolean) || "",
      text,
      missingTranslationKeys: allKeys.filter(key => text[key] === null),
      staticTexts: [],
      photos: uniqueImages(sections.flatMap(section => section.photos)),
      dom: {
        text: (pageSource.domText || []).map(item => ({
          id: String(item.id || ""),
          tag: String(item.tag || "span").toLowerCase(),
          value: resolveContentSourceDomText(pageSource, language, fallbackLanguage, item),
        })),
        images: (pageSource.images || []).map(image => normalizeContentSourceImage(image, "", assetsBaseUrl)),
      },
      settings: {
        ...(pageSource.settings && typeof pageSource.settings === "object" ? pageSource.settings : {}),
        homeProducts: normalizeProductIds(pageSource.settings?.homeProducts || defaultHomeProductIds),
      },
      purchaseLinks: Array.isArray(pageSource.purchaseLinks) ? pageSource.purchaseLinks : [],
      sections,
    },
  };
}

function applyContentOverrides(payload, countryId, language, pagePath, assetsBaseUrl) {
  const overrides = getPageOverrides(countryId, language, pagePath);
  const textOverrides = overrides.text || {};
  const domTextOverrides = overrides.domText || {};
  const domImageOverrides = overrides.domImages || {};
  const settingsOverrides = overrides.settings || {};

  for (const [key, value] of Object.entries(textOverrides)) {
    if (typeof value === "string") {
      payload.content.text[key] = value;
    }
  }

  for (const section of payload.content.sections || []) {
    for (const item of section.translatedTexts || []) {
      if (Object.prototype.hasOwnProperty.call(textOverrides, item.key)
        && typeof textOverrides[item.key] === "string") {
        item.value = textOverrides[item.key];
        item.source = "override";
      }
    }
  }

  payload.content.dom.text = (payload.content.dom.text || []).map(item => {
    if (!Object.prototype.hasOwnProperty.call(domTextOverrides, item.id)
      || typeof domTextOverrides[item.id] !== "string") {
      return item;
    }

    return {
      ...item,
      value: domTextOverrides[item.id],
      source: "override",
    };
  });

  payload.content.dom.images = (payload.content.dom.images || []).map(image => {
    const override = domImageOverrides[image.id];
    if (!override || typeof override !== "object" || Array.isArray(override)) {
      return image;
    }

    const src = typeof override.src === "string" ? override.src : image.src;
    return {
      ...image,
      src,
      url: makeAssetUrl(src, assetsBaseUrl),
      alt: typeof override.alt === "string" ? override.alt : image.alt,
      loading: typeof override.loading === "string" ? override.loading : image.loading,
      srcset: typeof override.srcset === "string" ? override.srcset : image.srcset,
      sizes: typeof override.sizes === "string" ? override.sizes : image.sizes,
      source: "override",
    };
  });

  const overriddenTitle = payload.content.dom.text.find(item => {
    return item.tag === "title" && Object.prototype.hasOwnProperty.call(domTextOverrides, item.id);
  });
  if (overriddenTitle) {
    payload.content.pageTitle = overriddenTitle.value;
  }

  payload.content.settings = {
    ...(payload.content.settings || {}),
    ...settingsOverrides,
  };
  syncHomeProducts(payload);

  payload.content.overrides = {
    updatedAt: overrides.updatedAt,
    textKeys: Object.keys(textOverrides),
    domTextIds: Object.keys(domTextOverrides),
    domImageIds: Object.keys(domImageOverrides),
    settingKeys: Object.keys(settingsOverrides),
  };
}

function getPagePayload(options = {}) {
  const config = loadConfig();
  const countryConfig = findCountryConfig(config, options.country);
  const homepageConfig = countryConfig.homepage || {};
  const requestedPagePath = normalizePagePath(options.page || options.pagePath || options.path);
  validateNormalizedPagePath(requestedPagePath);
  const contentSource = loadContentSource(config);
  const pageSource = contentSource.pages[requestedPagePath];
  const countriesDataPath = resolveBackendPath(homepageConfig.worldwideCountriesPath || homepageConfig.countriesDataPath);
  const worldwideCountries = loadWorldwideCountries(countriesDataPath);
  const worldwideCountry = findWorldwideCountry(countryConfig, worldwideCountries);

  if (pageSource) {
    const payload = buildContentSourcePayload({
      countryConfig,
      pagePath: requestedPagePath,
      pageSource,
      languageInput: options.lang || options.language,
      assetsBaseUrl: homepageConfig.assetsBaseUrl,
      worldwideCountry,
    });
    attachProductCatalog(payload, countryConfig, homepageConfig);
    applyCountrySpecificContent(payload, countryConfig);

    if (options.applyOverrides !== false) {
      applyContentOverrides(
        payload,
        countryConfig.id,
        payload.language,
        requestedPagePath,
        homepageConfig.assetsBaseUrl
      );
    }

    return payload;
  }

  if (!homepageConfig.htmlPath) {
    throw Object.assign(new Error(`Page "${requestedPagePath}" was not found.`), {
      statusCode: 404,
      code: "PAGE_NOT_FOUND",
      page: requestedPagePath,
    });
  }

  const { htmlPath, pagePath } = resolveHtmlPath(homepageConfig, requestedPagePath);
  const translationScriptPath = resolveBackendPath(homepageConfig.translationScriptPath);

  const html = fs.readFileSync(htmlPath, "utf8");
  const translations = loadTranslations(translationScriptPath);
  const productFallbackTools = loadProductFallbackTools(translationScriptPath);
  const language = chooseLanguage(countryConfig, translations, options.lang || options.language);
  const fallbackLanguage = countryConfig.defaultLanguage || language;
  const sections = extractSections(html).map(section =>
    buildSectionPayload(section, translations, productFallbackTools, language, fallbackLanguage, homepageConfig.assetsBaseUrl)
  );
  const allKeys = extractTranslationKeys(html);
  const text = Object.fromEntries(
    allKeys.map(key => {
      const translated = resolveTranslation(translations, productFallbackTools, language, fallbackLanguage, key);
      return [key, translated.value];
    })
  );

  const payload = {
    country: {
      id: countryConfig.id,
      name: countryConfig.name,
      siteName: countryConfig.siteName,
      domain: countryConfig.domain,
      siteUrl: countryConfig.siteUrl,
      defaultLanguage: countryConfig.defaultLanguage,
      supportedLanguages: countryConfig.supportedLanguages || [],
      worldwide: worldwideCountry,
    },
    language,
    requestedLanguage: options.lang || options.language || null,
    page: {
      path: pagePath,
    },
    content: {
      pageTitle: extractPageTitle(html),
      text,
      missingTranslationKeys: allKeys.filter(key => text[key] === null),
      staticTexts: unique(sections.flatMap(section => section.staticTexts)),
      photos: uniqueImages(sections.flatMap(section => section.photos)),
      dom: {
        text: extractBackendTextItems(html),
        images: extractBackendImages(html, homepageConfig.assetsBaseUrl),
      },
      sections,
    },
  };

  applyCountrySpecificContent(payload, countryConfig);

  if (options.applyOverrides !== false) {
    applyContentOverrides(payload, countryConfig.id, language, pagePath, homepageConfig.assetsBaseUrl);
  }

  return payload;
}

function getHomepagePayload(options = {}) {
  return getPagePayload({ ...options, page: "index.html" });
}

function uniqueImages(images) {
  const seen = new Set();
  return images.filter(image => {
    const key = `${image.section}:${image.src}:${image.alt}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = {
  getHomepagePayload,
  getPagePayload,
  listCountries,
};
