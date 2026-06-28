import { initializeDatabase, closeDatabase, db } from './db';

async function seed() {
  await initializeDatabase();
  await db.query(`
    INSERT INTO prospects (phone,name,company,industry,stage,score,intent,needs,missing_fields,last_contact_at)
    VALUES
      ('+22997000001','Aïcha','Saveurs du Bénin','Restauration','qualified',78,'Automatiser commandes et réservations','["Commandes WhatsApp","Réservations"]','["budget"]',NOW()-INTERVAL '1 hour'),
      ('+22462000002','Mamadou','Conakry Services','Services B2B','appointment_proposed',84,'Automatiser devis et relances','["Devis","Relances"]','[]',NOW()-INTERVAL '3 hours'),
      ('+22177000003','Fatou','Teranga Mode','Commerce','new',45,'Présenter le catalogue et qualifier les clientes','["Catalogue"]','["budget","délai"]',NOW()-INTERVAL '1 day')
    ON CONFLICT (phone) DO NOTHING;
  `);
  await closeDatabase();
  console.log('Données de démonstration ajoutées.');
}

void seed();