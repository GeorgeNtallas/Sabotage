const { chromium } = require('playwright');

async function runAutomatedTest() {
  const players = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
  const browsers = [];
  const pages = [];
  let roomId = '';

  try {
    console.log('🚀 Starting automated 6-player Avalon test...');

    // Launch 6 browser instances
    for (let i = 0; i < players.length; i++) {
      const browser = await chromium.launch({ 
        headless: false,
        args: ['--start-maximized']
      });
      const page = await browser.newPage();
      await page.goto('http://localhost:3000');
      
      browsers.push(browser);
      pages.push(page);
      console.log(`✅ ${players[i]} browser opened`);
    }

    // Player 1 creates game
    console.log('🎮 Alice creating game...');
    await pages[0].fill('input[placeholder="Your name"]', players[0]);
    await pages[0].click('text=Create Game');
    
    // Wait for lobby and extract room ID
    await pages[0].waitForURL(/lobby\?session=/);
    roomId = pages[0].url().split('session=')[1];
    console.log(`🏠 Room created: ${roomId}`);

    // Other players join
    for (let i = 1; i < players.length; i++) {
      console.log(`👥 ${players[i]} joining...`);
      await pages[i].fill('input[placeholder="Your name"]', players[i]);
      await pages[i].fill('input[placeholder="Password"]', roomId);
      await pages[i].click('text=Join Game');
      await pages[i].waitForURL(/lobby\?session=/);
    }

    // All players get ready
    console.log('⏳ All players getting ready...');
    for (let i = 0; i < players.length; i++) {
      await pages[i].click('text=Ready');
      console.log(`✅ ${players[i]} ready`);
    }

    // Alice starts the game
    console.log('🎯 Starting game...');
    await pages[0].click('text=Start Game');

    // Wait for all players to reach game page
    console.log('🎲 Waiting for character assignment...');
    for (let i = 0; i < players.length; i++) {
      await pages[i].waitForSelector('text=Avalon Game', { timeout: 10000 });
      console.log(`🎭 ${players[i]} entered game page`);
    }

    console.log('\n🎉 SUCCESS! All 6 players are now in the game!');
    console.log('📋 Check each browser window to see character assignments');
    console.log('⌨️  Press Ctrl+C to close all browsers');

    // Keep browsers open
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    for (const browser of browsers) {
      await browser.close();
    }
  }
}

runAutomatedTest();