import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EventsService } from '../events/events.service';
import { Logger } from '@nestjs/common';

/**
 * Script untuk update basePrice semua event yang sudah ada
 * berdasarkan harga ticket category termurah
 */
async function updateBasePrices() {
  const logger = new Logger('UpdateBasePrices');
  
  logger.log('🚀 Starting base price update script...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const eventsService = app.get(EventsService);

  try {
    // Get all events
    const { events } = await eventsService.findAll(1, 1000);
    
    logger.log(`📊 Found ${events.length} events to process`);

    for (const event of events) {
      logger.log(`Processing event: ${event.title} (${event.id})`);
      
      try {
        await eventsService.updateBasePrice(event.id);
        logger.log(`✅ Updated basePrice for event: ${event.title}`);
      } catch (error) {
        logger.error(`❌ Failed to update basePrice for event ${event.title}:`, error.message);
      }
    }

    logger.log('✨ Base price update completed!');
  } catch (error) {
    logger.error('❌ Script failed:', error);
  } finally {
    await app.close();
  }
}

// Run the script
updateBasePrices()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
