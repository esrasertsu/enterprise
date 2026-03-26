import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

type AdminLocale = 'de' | 'en' | 'fr' | 'lb' | 'tr'

type AdminTranslationTree = Record<string, string | AdminTranslationTree>

const storageKey = 'admin-language'

const adminLanguageOptions = [
  { value: 'en', label: 'English (EN)' },
  { value: 'tr', label: 'Turkce (TR)' },
  { value: 'fr', label: 'Francais (FR)' },
  { value: 'de', label: 'Deutsch (DE)' },
  { value: 'lb', label: 'Lebuergesch (LB)' },
] as const

const intlLocaleMap: Record<AdminLocale, string> = {
  de: 'de-DE',
  en: 'en-GB',
  fr: 'fr-FR',
  lb: 'lb-LU',
  tr: 'tr-TR',
}

const translations: Record<AdminLocale, AdminTranslationTree> = {
  en: {
    menu: {
      dashboard: 'Dashboard',
      categories: 'Categories',
      orders: 'Orders',
      products: 'Products',
      customers: 'Customers',
      sales: 'Sales tracking',
      overview: 'Overview',
      catalog: 'Catalog',
      fulfillment: 'Fulfillment',
      accounts: 'Accounts',
      revenue: 'Revenue',
    },
    shell: {
      brand: 'Ecommerce Admin',
      tagline: 'packaging operations',
      currentFocus: 'Current focus',
      workspace: 'Admin workspace',
      frontend: 'Frontend',
      layoutActive: 'TSX layout active',
      language: 'Language',
    },
    dashboard: {
      eyebrow: 'Admin home',
      title: 'Manage the operations center from one place.',
      description: 'The left navigation is now the main admin entry. Existing modules keep the same shell while new ones can grow into it.',
      cta: 'Open products',
      statsModules: 'Active modules',
      statsModulesDetail: 'Dashboard, categories, orders, products, customers and sales tracking are ready as separate entries.',
      statsCatalog: 'Catalog status',
      statsCatalogDetail: 'Category editor and product editor are active in the same admin shell.',
      statsNext: 'Next delivery',
      statsNextDetail: 'The next logical module is order list and status tracking.',
      moduleCategories: 'Category management',
      moduleCategoriesDesc: 'Create, edit and manage parent-child structure plus multilingual category fields.',
      moduleProducts: 'Catalog management',
      moduleProductsDesc: 'Existing product create, edit, variants, attributes and media management live here.',
      moduleOrders: 'Order operations',
      moduleOrdersDesc: 'Reserved area for order listing, status changes and fulfillment timeline.',
      moduleSales: 'Sales visibility',
      moduleSalesDesc: 'Reserved area for daily volume, quote conversion and category-based sales monitoring.',
    },
    placeholders: {
      modulesReady: 'Ready modules',
      modulesReadyDesc: 'This area is reserved for order flows, customer segments or revenue panels. Products is the active module right now.',
      nextStep: 'Next step',
      nextStepDesc: 'As backend endpoints arrive, lists, filters and detail cards can be added in the same dashboard language.',
      customersTitle: 'Customers',
      customersEyebrow: 'CRM',
      customersDesc: 'Customer profiles, addresses, order history and quote interactions can be collected in this area.',
      salesTitle: 'Sales tracking',
      salesEyebrow: 'Analytics',
      salesDesc: 'Space is reserved for KPI panels such as category volume, quote conversions and channel performance.',
    },
    categories: {
      heroEyebrow: 'Admin Catalog',
      heroTitle: 'Category Editor',
      heroDescription: 'Create categories, edit existing ones and manage EN, TR, FR, DE and LB translations for each category.',
      listTitle: 'Categories',
      new: 'New category',
      select: 'Select category',
      create: 'Create category',
      edit: 'Edit category',
      createSubtitle: 'New category definition',
      general: 'General',
      translations: 'Translations',
      images: 'Image',
      addTranslation: 'Add translation',
      delete: 'Delete category',
      deleteConfirm: 'Delete this category?',
      save: 'Save category',
      createAction: 'Create category',
      updateAction: 'Update category',
      emptyImage: 'No category image uploaded yet.',
      emptyImageHint: 'Save the category first, then upload an image file.',
      upload: 'Upload image',
      replaceImage: 'Replace image',
      removeImage: 'Remove image',
    },
    products: {
      heroEyebrow: 'Admin Catalog',
      heroTitle: 'Product Editor',
      heroDescription: 'Create products, update them, manage variants, fill technical fields and handle media after saving.',
      listTitle: 'Products',
      new: 'New product',
      select: 'Select product',
      create: 'Create product',
      edit: 'Edit product',
      createSubtitle: 'New product definition',
      delete: 'Delete product',
      deleteConfirm: 'Delete this product?',
      general: 'General',
      translations: 'Translations',
      variants: 'Variants',
      attributes: 'Attributes',
      images: 'Images',
      addTranslation: 'Add translation',
      addVariant: 'Add variant',
      addAttribute: 'Add attribute',
    },
    orders: {
      eyebrow: 'Operations',
      title: 'Orders',
      description: 'This screen now reads real order data from the backend. Status, payment, fulfillment and volume sit in the same panel.',
      streamTitle: 'Order stream',
      countLabel: 'orders',
      columnsNumber: 'No',
      columnsCustomer: 'Customer',
      columnsItems: 'Items',
      columnsAmount: 'Amount',
      columnsOrder: 'Order',
      columnsPayment: 'Payment',
      columnsFulfillment: 'Fulfillment',
      columnsDate: 'Date',
      totalOrders: 'Total orders',
      totalOrdersDetail: 'Read from the live order table.',
      openOrders: 'Open orders',
      openOrdersDetail: 'Moving orders outside delivered or returned.',
      revenue: 'Revenue',
      revenueDetail: 'Total value of the listed orders.',
      designSupport: 'Design support',
      designSupportDetail: 'Orders that require artwork or design coordination.',
    },
  },
  tr: {
    menu: { dashboard: 'Dashboard', categories: 'Kategoriler', orders: 'Siparisler', products: 'Urunler', customers: 'Musteriler', sales: 'Satis takibi', overview: 'Genel', catalog: 'Katalog', fulfillment: 'Operasyon', accounts: 'Hesaplar', revenue: 'Gelir' },
    shell: { brand: 'Ecommerce Admin', tagline: 'ambalaj operasyonlari', currentFocus: 'Odak alan', workspace: 'Admin alani', frontend: 'Frontend', layoutActive: 'TSX yerlesim aktif', language: 'Dil' },
    dashboard: { eyebrow: 'Admin ana sayfa', title: 'Operasyon merkezini tek yerden yonet.', description: 'Sol menu artik admin icin ana giris. Mevcut moduller ayni kabukta kalir, yenileri de buraya buyur.', cta: 'Urunleri ac', statsModules: 'Aktif moduller', statsModulesDetail: 'Dashboard, kategoriler, siparisler, urunler, musteriler ve satis takibi ayri girisler olarak hazir.', statsCatalog: 'Katalog durumu', statsCatalogDetail: 'Kategori editoru ve urun editoru ayni admin kabugunda aktif.', statsNext: 'Siradaki teslim', statsNextDetail: 'Siradaki mantikli modul siparis listesi ve durum takibi.', moduleCategories: 'Kategori yonetimi', moduleCategoriesDesc: 'Kategori olustur, duzenle, parent-child yapisini ve cok dilli alanlari yonet.', moduleProducts: 'Katalog yonetimi', moduleProductsDesc: 'Urun olusturma, guncelleme, varyant, attribute ve medya yonetimi burada.', moduleOrders: 'Siparis operasyonu', moduleOrdersDesc: 'Siparis listeleme, durum degisimi ve fulfillment timeline icin ayrilan alan.', moduleSales: 'Satis gorunurlugu', moduleSalesDesc: 'Gunluk hacim, teklif donusumu ve kategori bazli satis takibi icin ayrilan alan.' },
    placeholders: { modulesReady: 'Hazir moduller', modulesReadyDesc: 'Bu alan siparis akisleri, musteri segmentleri veya gelir panelleri icin ayrildi. Su an aktif modul Products.', nextStep: 'Sonraki adim', nextStepDesc: 'Backend endpointleri geldikce ayni dashboard diliyle liste, filtre ve detay kartlari eklenebilir.', customersTitle: 'Musteriler', customersEyebrow: 'CRM', customersDesc: 'Musteri profilleri, adresler, siparis gecmisi ve teklif etkilesimi bu alanda toplanabilir.', salesTitle: 'Satis takibi', salesEyebrow: 'Analitik', salesDesc: 'Kategori bazli hacim, teklif donusumu ve kanal performansi gibi KPI panelleri icin alan ayrildi.' },
    categories: { heroEyebrow: 'Admin Katalog', heroTitle: 'Kategori Editoru', heroDescription: 'Kategori olustur, mevcutlari duzenle ve her kategori icin EN, TR, FR, DE, LB translation alanlarini yonet.', listTitle: 'Kategoriler', new: 'Yeni kategori', select: 'Kategori sec', create: 'Kategori olustur', edit: 'Kategori duzenle', createSubtitle: 'Yeni kategori tanimi', general: 'Genel', translations: 'Translation alanlari', images: 'Gorsel', addTranslation: 'Translation ekle', delete: 'Kategoriyi sil', deleteConfirm: 'Bu kategori silinsin mi?', save: 'Kategoriyi kaydet', createAction: 'Kategori olustur', updateAction: 'Kategoriyi guncelle', emptyImage: 'Henuz kategori gorseli yuklenmedi.', emptyImageHint: 'Once kategoriyi kaydet, sonra gorsel yukle.', upload: 'Gorsel yukle', replaceImage: 'Gorseli degistir', removeImage: 'Gorseli kaldir' },
    products: { heroEyebrow: 'Admin Katalog', heroTitle: 'Urun Editoru', heroDescription: 'Urun olustur, guncelle, varyantlarini yonet, teknik alanlari doldur ve kaydettikten sonra medya akisini yonet.', listTitle: 'Urunler', new: 'Yeni urun', select: 'Urun sec', create: 'Urun olustur', edit: 'Urun duzenle', createSubtitle: 'Yeni urun tanimi', delete: 'Urunu sil', deleteConfirm: 'Bu urun silinsin mi?', general: 'Genel', translations: 'Translation alanlari', variants: 'Varyantlar', attributes: 'Ozellikler', images: 'Gorseller', addTranslation: 'Translation ekle', addVariant: 'Varyant ekle', addAttribute: 'Ozellik ekle' },
    orders: { eyebrow: 'Operasyon', title: 'Siparisler', description: 'Bu ekran artik backendden gercek siparis verisini cekiyor. Durum, odeme, fulfillment ve hacim ayni panelde.', streamTitle: 'Siparis akisi', countLabel: 'siparis', columnsNumber: 'No', columnsCustomer: 'Musteri', columnsItems: 'Satir', columnsAmount: 'Tutar', columnsOrder: 'Siparis', columnsPayment: 'Odeme', columnsFulfillment: 'Fulfillment', columnsDate: 'Tarih', totalOrders: 'Toplam siparis', totalOrdersDetail: 'Canli order tablosundan okunuyor.', openOrders: 'Acil siparisler', openOrdersDetail: 'Teslim veya iade disindaki hareketli siparisler.', revenue: 'Ciro', revenueDetail: 'Listelenen siparislerin toplam tutari.', designSupport: 'Tasarim destekli', designSupportDetail: 'Artwork veya tasarim koordinasyonu isteyen siparisler.' },
  },
  fr: {
    menu: { dashboard: 'Tableau de bord', categories: 'Categories', orders: 'Commandes', products: 'Produits', customers: 'Clients', sales: 'Suivi des ventes', overview: 'Vue d ensemble', catalog: 'Catalogue', fulfillment: 'Execution', accounts: 'Comptes', revenue: 'Revenu' },
    shell: { brand: 'Ecommerce Admin', tagline: 'operations packaging', currentFocus: 'Zone active', workspace: 'Espace admin', frontend: 'Frontend', layoutActive: 'Disposition TSX active', language: 'Langue' },
    dashboard: { eyebrow: 'Accueil admin', title: 'Gerez le centre operationnel depuis un seul endroit.', description: 'La navigation de gauche est maintenant l entree principale. Les modules existants gardent le meme shell.', cta: 'Ouvrir les produits', statsModules: 'Modules actifs', statsModulesDetail: 'Tableau de bord, categories, commandes, produits, clients et suivi des ventes sont prets.', statsCatalog: 'Etat du catalogue', statsCatalogDetail: 'Les editeurs categorie et produit sont actifs dans le meme shell admin.', statsNext: 'Livraison suivante', statsNextDetail: 'Le prochain module logique est la liste des commandes avec suivi des statuts.', moduleCategories: 'Gestion des categories', moduleCategoriesDesc: 'Creer, modifier et gerer la structure parent-enfant et les champs multilingues.', moduleProducts: 'Gestion du catalogue', moduleProductsDesc: 'Creation produit, edition, variantes, attributs et medias vivent ici.', moduleOrders: 'Operations de commande', moduleOrdersDesc: 'Zone reservee a la liste des commandes, changements de statut et timeline de fulfillment.', moduleSales: 'Visibilite commerciale', moduleSalesDesc: 'Zone reservee au volume quotidien, conversion devis et suivi des ventes par categorie.' },
    placeholders: { modulesReady: 'Modules prets', modulesReadyDesc: 'Cette zone est reservee aux flux de commande, segments clients ou panneaux de revenu. Products est actif pour le moment.', nextStep: 'Etape suivante', nextStepDesc: 'Quand les endpoints backend arrivent, listes, filtres et cartes detail peuvent etre ajoutes.', customersTitle: 'Clients', customersEyebrow: 'CRM', customersDesc: 'Profils clients, adresses, historique de commande et interactions devis peuvent etre rassembles ici.', salesTitle: 'Suivi des ventes', salesEyebrow: 'Analytics', salesDesc: 'Espace reserve aux KPI comme volume par categorie, conversions de devis et performance canal.' },
    categories: { heroEyebrow: 'Catalogue Admin', heroTitle: 'Editeur de categories', heroDescription: 'Creez des categories, modifiez les existantes et gerez les traductions EN, TR, FR, DE et LB.', listTitle: 'Categories', new: 'Nouvelle categorie', select: 'Choisir une categorie', create: 'Creer une categorie', edit: 'Modifier la categorie', createSubtitle: 'Nouvelle definition de categorie', general: 'General', translations: 'Traductions', images: 'Image', addTranslation: 'Ajouter une traduction', delete: 'Supprimer la categorie', deleteConfirm: 'Supprimer cette categorie ?', save: 'Enregistrer la categorie', createAction: 'Creer la categorie', updateAction: 'Mettre a jour la categorie', emptyImage: 'Aucune image de categorie telechargee.', emptyImageHint: 'Enregistrez d abord la categorie puis telechargez une image.', upload: 'Telecharger l image', replaceImage: 'Remplacer l image', removeImage: 'Supprimer l image' },
    products: { heroEyebrow: 'Catalogue Admin', heroTitle: 'Editeur de produits', heroDescription: 'Creez des produits, modifiez-les, gerez les variantes et les medias apres sauvegarde.', listTitle: 'Produits', new: 'Nouveau produit', select: 'Choisir un produit', create: 'Creer un produit', edit: 'Modifier le produit', createSubtitle: 'Nouvelle definition produit', delete: 'Supprimer le produit', deleteConfirm: 'Supprimer ce produit ?', general: 'General', translations: 'Traductions', variants: 'Variantes', attributes: 'Attributs', images: 'Images', addTranslation: 'Ajouter une traduction', addVariant: 'Ajouter une variante', addAttribute: 'Ajouter un attribut' },
    orders: { eyebrow: 'Operations', title: 'Commandes', description: 'Cet ecran lit maintenant les vraies donnees de commande depuis le backend.', streamTitle: 'Flux de commandes', countLabel: 'commandes', columnsNumber: 'No', columnsCustomer: 'Client', columnsItems: 'Lignes', columnsAmount: 'Montant', columnsOrder: 'Commande', columnsPayment: 'Paiement', columnsFulfillment: 'Execution', columnsDate: 'Date', totalOrders: 'Commandes totales', totalOrdersDetail: 'Lues depuis la table des commandes.', openOrders: 'Commandes ouvertes', openOrdersDetail: 'Commandes en mouvement hors livrees ou retournees.', revenue: 'Revenu', revenueDetail: 'Valeur totale des commandes listees.', designSupport: 'Support design', designSupportDetail: 'Commandes qui necessitent coordination artwork ou design.' },
  },
  de: {
    menu: { dashboard: 'Dashboard', categories: 'Kategorien', orders: 'Bestellungen', products: 'Produkte', customers: 'Kunden', sales: 'Vertrieb', overview: 'Ubersicht', catalog: 'Katalog', fulfillment: 'Abwicklung', accounts: 'Konten', revenue: 'Umsatz' },
    shell: { brand: 'Ecommerce Admin', tagline: 'verpackungsbetrieb', currentFocus: 'Aktueller Fokus', workspace: 'Admin Arbeitsbereich', frontend: 'Frontend', layoutActive: 'TSX Layout aktiv', language: 'Sprache' },
    dashboard: { eyebrow: 'Admin Start', title: 'Steuern Sie das Operationszentrum an einem Ort.', description: 'Die linke Navigation ist jetzt der zentrale Einstieg. Bestehende Module bleiben im gleichen Shell.', cta: 'Produkte offnen', statsModules: 'Aktive Module', statsModulesDetail: 'Dashboard, Kategorien, Bestellungen, Produkte, Kunden und Vertrieb sind als eigene Eintrage bereit.', statsCatalog: 'Katalogstatus', statsCatalogDetail: 'Kategorie- und Produkteditor sind im selben Admin-Shell aktiv.', statsNext: 'Nachster Lieferbaustein', statsNextDetail: 'Das nachste logische Modul ist die Bestellliste mit Statusverfolgung.', moduleCategories: 'Kategorien verwalten', moduleCategoriesDesc: 'Kategorien erstellen, bearbeiten und Parent-Child-Struktur plus mehrsprachige Felder verwalten.', moduleProducts: 'Katalog verwalten', moduleProductsDesc: 'Produktanlage, Bearbeitung, Varianten, Attribute und Medienverwaltung liegen hier.', moduleOrders: 'Bestelloperationen', moduleOrdersDesc: 'Reservierter Bereich fur Bestellliste, Statuswechsel und Fulfillment-Zeitleiste.', moduleSales: 'Vertriebsblick', moduleSalesDesc: 'Reservierter Bereich fur Tagesvolumen, Angebotskonversion und kategoriebasiertes Sales-Monitoring.' },
    placeholders: { modulesReady: 'Bereite Module', modulesReadyDesc: 'Dieser Bereich ist fur Bestellflusse, Kundensegmente oder Umsatzpanels reserviert. Products ist derzeit aktiv.', nextStep: 'Nachster Schritt', nextStepDesc: 'Sobald Backend-Endpunkte vorliegen, konnen Listen, Filter und Detailkarten im gleichen Dashboard-Stil erganzt werden.', customersTitle: 'Kunden', customersEyebrow: 'CRM', customersDesc: 'Kundenprofile, Adressen, Bestellhistorie und Angebotsinteraktionen konnen hier gesammelt werden.', salesTitle: 'Vertrieb', salesEyebrow: 'Analytics', salesDesc: 'Raum fur KPI-Panels wie Kategorienvolumen, Angebotskonversionen und Kanalperformance.' },
    categories: { heroEyebrow: 'Admin Katalog', heroTitle: 'Kategorie Editor', heroDescription: 'Erstellen Sie Kategorien, bearbeiten Sie bestehende und verwalten Sie EN, TR, FR, DE und LB Ubersetzungen.', listTitle: 'Kategorien', new: 'Neue Kategorie', select: 'Kategorie auswahlen', create: 'Kategorie erstellen', edit: 'Kategorie bearbeiten', createSubtitle: 'Neue Kategoriedefinition', general: 'Allgemein', translations: 'Ubersetzungen', images: 'Bild', addTranslation: 'Ubersetzung hinzufugen', delete: 'Kategorie loschen', deleteConfirm: 'Diese Kategorie loschen?', save: 'Kategorie speichern', createAction: 'Kategorie erstellen', updateAction: 'Kategorie aktualisieren', emptyImage: 'Noch kein Kategorienbild hochgeladen.', emptyImageHint: 'Speichern Sie zuerst die Kategorie und laden Sie dann ein Bild hoch.', upload: 'Bild hochladen', replaceImage: 'Bild ersetzen', removeImage: 'Bild entfernen' },
    products: { heroEyebrow: 'Admin Katalog', heroTitle: 'Produkt Editor', heroDescription: 'Produkte erstellen, aktualisieren, Varianten verwalten und Medien nach dem Speichern steuern.', listTitle: 'Produkte', new: 'Neues Produkt', select: 'Produkt auswahlen', create: 'Produkt erstellen', edit: 'Produkt bearbeiten', createSubtitle: 'Neue Produktdefinition', delete: 'Produkt loschen', deleteConfirm: 'Dieses Produkt loschen?', general: 'Allgemein', translations: 'Ubersetzungen', variants: 'Varianten', attributes: 'Attribute', images: 'Bilder', addTranslation: 'Ubersetzung hinzufugen', addVariant: 'Variante hinzufugen', addAttribute: 'Attribut hinzufugen' },
    orders: { eyebrow: 'Betrieb', title: 'Bestellungen', description: 'Dieser Bildschirm liest jetzt echte Bestelldaten aus dem Backend.', streamTitle: 'Bestellstrom', countLabel: 'Bestellungen', columnsNumber: 'Nr.', columnsCustomer: 'Kunde', columnsItems: 'Positionen', columnsAmount: 'Betrag', columnsOrder: 'Bestellung', columnsPayment: 'Zahlung', columnsFulfillment: 'Abwicklung', columnsDate: 'Datum', totalOrders: 'Bestellungen gesamt', totalOrdersDetail: 'Aus der Live-Bestelltabelle gelesen.', openOrders: 'Offene Bestellungen', openOrdersDetail: 'Laufende Bestellungen ausser zugestellt oder retourniert.', revenue: 'Umsatz', revenueDetail: 'Gesamtwert der gelisteten Bestellungen.', designSupport: 'Design-Support', designSupportDetail: 'Bestellungen mit Artwork- oder Designabstimmung.' },
  },
  lb: {
    menu: { dashboard: 'Dashboard', categories: 'Kategorien', orders: 'Bestellungen', products: 'Produiten', customers: 'Clienten', sales: 'Verkaaf', overview: 'Iwwerbléck', catalog: 'Katalog', fulfillment: 'Ausfuerung', accounts: 'Konten', revenue: 'Akommes' },
    shell: { brand: 'Ecommerce Admin', tagline: 'verpackungsoperatiounen', currentFocus: 'Aktuelle Fokus', workspace: 'Admin Beräich', frontend: 'Frontend', layoutActive: 'TSX Layout aktiv', language: 'Sprooch' },
    dashboard: { eyebrow: 'Admin Start', title: 'Steier den Operatiounszentrum op enger Plaz.', description: 'D lénks Navigatioun ass elo den Haaptagank. Bestehend Moduler bleiwen am selwechte Shell.', cta: 'Produiten opmaachen', statsModules: 'Aktiv Moduler', statsModulesDetail: 'Dashboard, Kategorien, Bestellungen, Produiten, Clienten a Verkaaf sinn als Entréeen prett.', statsCatalog: 'Katalogstatus', statsCatalogDetail: 'Kategorie- a Produkteditor sinn am selwechten Admin-Shell aktiv.', statsNext: 'Nächst Liwwerung', statsNextDetail: 'Den nächste logesche Modul ass d Bestelllëscht mat Statusverfolgung.', moduleCategories: 'Kategorieverwaltung', moduleCategoriesDesc: 'Kategorien erstellen, änneren an Parent-Child-Struktur plus méisproocheg Felder geréieren.', moduleProducts: 'Katalogverwaltung', moduleProductsDesc: 'Produktanlage, Editioun, Varianten, Attributer a Medienverwaltung sinn hei.', moduleOrders: 'Bestelloperatiounen', moduleOrdersDesc: 'Reservéierte Beräich fir Bestelllëscht, Statusännerungen a Fulfillment-Timeline.', moduleSales: 'Verkaafsvisioun', moduleSalesDesc: 'Reservéierte Beräich fir deeglecht Volumen, Offer-Konversioun a Kategorie-baséiert Verkaafsiwwerwaachung.' },
    placeholders: { modulesReady: 'Bereet Moduler', modulesReadyDesc: 'Dëse Beräich ass fir Bestellflëss, Clientsegmenter oder Akommes-Panele reservéiert. Products ass aktuell aktiv.', nextStep: 'Nächste Schrëtt', nextStepDesc: 'Soubal Backend-Endpunkte do sinn, kënne Lëschten, Filteren an Detailkaarten am selwechten Dashboard-Stil ergänzt ginn.', customersTitle: 'Clienten', customersEyebrow: 'CRM', customersDesc: 'Clientsprofiler, Adressen, Bestellgeschicht an Offer-Interaktioune kënnen hei gesammelt ginn.', salesTitle: 'Verkaaf', salesEyebrow: 'Analytics', salesDesc: 'Plaz fir KPI-Panels wéi Kategorievolumen, Offer-Konversiounen a Kanalperformance.' },
    categories: { heroEyebrow: 'Admin Katalog', heroTitle: 'Kategorie Editor', heroDescription: 'Erstellt Kategorien, ännert bestoend a geréiert EN, TR, FR, DE an LB Iwwersetzungen.', listTitle: 'Kategorien', new: 'Nei Kategorie', select: 'Kategorie auswielen', create: 'Kategorie erstellen', edit: 'Kategorie änneren', createSubtitle: 'Nei Kategoriedefinitioun', general: 'Allgemeng', translations: 'Iwwersetzungen', images: 'Bild', addTranslation: 'Iwwersetzung dobäisetzen', delete: 'Kategorie läschen', deleteConfirm: 'Dës Kategorie läschen?', save: 'Kategorie späicheren', createAction: 'Kategorie erstellen', updateAction: 'Kategorie aktualiséieren', emptyImage: 'Nach kee Kategorie-Bild eropgelueden.', emptyImageHint: 'Späichert als éischt d Kategorie an luet dann e Bild erop.', upload: 'Bild eroplueden', replaceImage: 'Bild ersetzen', removeImage: 'Bild ewechhuelen' },
    products: { heroEyebrow: 'Admin Katalog', heroTitle: 'Produkt Editor', heroDescription: 'Produiten erstellen, aktualiséieren, Varianten geréieren a Medien no der Späicherung steieren.', listTitle: 'Produiten', new: 'Neit Produkt', select: 'Produkt auswielen', create: 'Produkt erstellen', edit: 'Produkt änneren', createSubtitle: 'Nei Produktdefinitioun', delete: 'Produkt läschen', deleteConfirm: 'Dëst Produkt läschen?', general: 'Allgemeng', translations: 'Iwwersetzungen', variants: 'Varianten', attributes: 'Attributer', images: 'Biller', addTranslation: 'Iwwersetzung dobäisetzen', addVariant: 'Variant dobäisetzen', addAttribute: 'Attribut dobäisetzen' },
    orders: { eyebrow: 'Operatiounen', title: 'Bestellungen', description: 'Dëse Bildschierm liest elo richteg Bestelldaten aus dem Backend.', streamTitle: 'Bestellstroum', countLabel: 'Bestellungen', columnsNumber: 'Nr.', columnsCustomer: 'Client', columnsItems: 'Positiounen', columnsAmount: 'Betrag', columnsOrder: 'Bestellung', columnsPayment: 'Bezuelung', columnsFulfillment: 'Ausfuerung', columnsDate: 'Datum', totalOrders: 'Total Bestellungen', totalOrdersDetail: 'Aus der Live-Bestelltabell gelies.', openOrders: 'Oppe Bestellungen', openOrdersDetail: 'Lafend Bestellungen ausser geliwwert oder zeréckkomm.', revenue: 'Akommes', revenueDetail: 'Gesamtwäert vun de opgelëschte Bestellungen.', designSupport: 'Design-Ënnerstëtzung', designSupportDetail: 'Bestellungen déi Artwork- oder Design-Koordinatioun brauchen.' },
  },
}

interface AdminI18nContextValue {
  locale: AdminLocale
  intlLocale: string
  setLocale: (locale: string) => void
  t: (key: string) => string
  languageOptions: typeof adminLanguageOptions
}

const AdminI18nContext = createContext<AdminI18nContextValue | null>(null)

function normalizeLocale(value: string | null | undefined): AdminLocale {
  const normalizedValue = value?.trim().toLowerCase().split('-')[0]
  return adminLanguageOptions.some((option) => option.value === normalizedValue) ? normalizedValue as AdminLocale : 'en'
}

function resolveTranslation(locale: AdminLocale, key: string): string {
  const segments = key.split('.')
  let current: string | AdminTranslationTree | undefined = translations[locale]

  for (const segment of segments) {
    if (!current || typeof current === 'string') {
      return key
    }

    current = current[segment]
  }

  return typeof current === 'string' ? current : key
}

export function AdminI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>(() => normalizeLocale(window.localStorage.getItem(storageKey)))

  const value = useMemo<AdminI18nContextValue>(() => ({
    locale,
    intlLocale: intlLocaleMap[locale],
    setLocale: (nextLocale: string) => {
      const normalizedLocale = normalizeLocale(nextLocale)
      setLocaleState(normalizedLocale)
      window.localStorage.setItem(storageKey, normalizedLocale)
      document.documentElement.lang = normalizedLocale
    },
    t: (key: string) => resolveTranslation(locale, key),
    languageOptions: adminLanguageOptions,
  }), [locale])

  return <AdminI18nContext.Provider value={value}>{children}</AdminI18nContext.Provider>
}

export function useAdminI18n() {
  const context = useContext(AdminI18nContext)

  if (!context) {
    throw new Error('useAdminI18n must be used within AdminI18nProvider')
  }

  return context
}