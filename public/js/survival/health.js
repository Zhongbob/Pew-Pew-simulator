import { scene, camera } from './main.js';
import { updatehealth } from './combat.js';

export const healthPotions = [];

function getHealthpotLoc() {
  scene.traverse((object) => {
    if (object.userData.tag === "healthpot") {
      if (!healthPotions.find(potion => potion.uuid === object.uuid)) {
        healthPotions.push(object);
      }
    }
  });
}

export function checkHealthPotionCollisions() {
    getHealthpotLoc()
    const playerPosition = camera.position;
    const collisionDistance = 0.3; // Adjust this value for pickup range
    
    for (let i = healthPotions.length - 1; i >= 0; i--) {
        const potion = healthPotions[i];
        const distance = playerPosition.distanceTo(potion.position);
        
        if (distance < collisionDistance) {
            // Player touched the potion
            console.log("Health potion collected!");
            
            // Heal player
            const healAmount = 5;
            updatehealth(healAmount); // Positive value to increase health
            
            // Remove potion from scene
            scene.remove(potion);
            
            // Remove from array
            healthPotions.splice(i, 1);
            
            break; // Only collect one potion per frame
       }
   }
}