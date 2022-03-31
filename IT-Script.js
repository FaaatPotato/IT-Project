/// api_version=2
var script = registerScript({
    name: "IT-Script",
    version: "1.0",
    authors: ["Hannes"]
});

//java imports für minecraft bezogenen code
var Display = Java.type('org.lwjgl.opengl.Display')
var Boss = Java.type("net.minecraft.entity.boss.BossStatus");
var C03 = Java.type("net.minecraft.network.play.client.C03PacketPlayer");
var thePlayer = Java.type("net.ccbluex.liquidbounce.utils.MovementUtils");
var MSTimer = Java.type('net.ccbluex.liquidbounce.utils.timer.MSTimer');
var EntityLiving = Java.type('net.minecraft.entity.EntityLivingBase');
var EntityPlayer = Java.type("net.minecraft.entity.player.EntityPlayer");

//java imports für rendering
var RenderUtils = Java.type('net.ccbluex.liquidbounce.utils.render.RenderUtils');
var GL11 = Java.type("org.lwjgl.opengl.GL11");
var Color = Java.type("java.awt.Color");
var Fonts = Java.type("net.ccbluex.liquidbounce.ui.font.Fonts");
var Gui = Java.type("net.minecraft.client.gui.Gui");
var ScaledResolution = Java.type("net.minecraft.client.gui.ScaledResolution");
var GuiInventory = Java.type("net.minecraft.client.gui.inventory.GuiInventory");

var Timer = new MSTimer();

//einfache mathematik rechnet winkel * pi / 180
Math.rad = function(deg) {
    return deg * Math.PI / 180;
}

//funktion um den nächstgelegenen Spieler zu bekommen
function getRTarget() {
	var filteredEntites = []
	for (var i in mc.theWorld.loadedEntityList){
		var target = mc.theWorld.loadedEntityList[i]

		if (target instanceof EntityPlayer && target != mc.thePlayer) { //lässt alle entitys vom typ spierler in einer Array (Liste) auftauchen
			filteredEntites.push(target)
		}
	}
	filteredEntites.sort(function(a, b){ //.sort sortiert alle zahlen nach kleinster stelle, jedoch nur 1 stellig. Um das zu verhindern benutzt man eine Vergleichsfunktion um den kleinsten wert auszugeben
		var distanceA = mc.thePlayer.getDistanceToEntity(a)
		var distanceB = mc.thePlayer.getDistanceToEntity(b)

		return distanceB - distanceA; // funktion gibt den korrekten und verglichenen Abstand aus
	})
	return filteredEntites[filteredEntites.length - 1] //gibt den letzten und richtigen kürzesten Abstand aus, -1 verhindert Ausgaben die nicht im Listenbereich liegen.
}

script.registerModule({
    name: "IT-Script",
    description: "Ein Script/Modul für LiquidBounce für IT",
    category: "Fun",
    tag: "LiquidScript",
    settings: {
        z: Setting.boolean({
            name: "Markierung",
            default: false
		}),
		L: Setting.float({
			name: "StrichStärke",
			default: 1,
			min:0,
			max:100
		}),
		S: Setting.float({
			name: "FadeSpeed",
			default: 0.1,
			min:0.01,
			max:0.5
		}),
		F: Setting.float({
			name: "DebugFade",
			default: 0.0,
			min:0.0,
			max:2.0
		}),
    }

}, function (module) {
    module.on("enable", function () {
    var sw = 0;
    module.settings.F.set(0);
    });
    module.on("disable", function () {
    var sw = 0;
    module.settings.F.set(0);
    });
    module.on("world", function () {
    var sw = 0;
    });
    module.on("update", function () {
    if (module.settings.F.get() >= 2) {
    sw = 1	
    }
    if (module.settings.F.get() <= 0) {
    sw = 0;	
    }
    
    if (sw == 1) {
    module.settings.F.set(module.settings.F.get()-module.settings.S.get())	
    }
    if (sw == 0) {
    module.settings.F.set(module.settings.F.get()+module.settings.S.get())	
    }
    });
    module.on("render2D", function (e) { //greift auf die 2d Bildschrimfläche zu und erlaubt eingefügte objekte auf 2d ebene
    	
    //benötigte variabeln, einfach um alles zusammenzufassen	
    var mcWidth = new ScaledResolution(mc).getScaledWidth();
    var mcHeight = new ScaledResolution(mc).getScaledHeight();
    var BackColor = new Color(23,23,25,203).getRGB();
    var Font = Fonts.font40;
    
	GL11.glPushMatrix();
	
	Gui.drawRect(mcWidth/2+15, mcHeight/2+44, mcWidth/2+135, mcHeight/2+73, BackColor);	

    Font.drawStringWithShadow(getRTarget().getName(), mcWidth/2+45, mcHeight/2+49, 0xFFFFFF);
    mc.fontRendererObj.drawStringWithShadow("§c", mcWidth/2+17, mcHeight/2+73.3, 0xFFFFFF);
    
    Font.drawStringWithShadow("Distanz: "+mc.thePlayer.getDistanceToEntity(getRTarget()).toFixed(1), mcWidth/2+45, mcHeight/2+62, 0xFFFFFF);
	
	GL11.glPopMatrix();
	
	drawFace(getRTarget(), mcWidth/2+16.3, mcHeight/2+45.8);
    });
    
    module.on("render3D", function () { //greift auf die 3d Bildschrimfläche zu und erlaubt eingefügte objekte auf 3d ebene, also auch im spiel
    	
    if (module.settings.z.get()) {	
    GL11.glPushMatrix();
    
    GL11.glTranslated(
    getRTarget().lastTickPosX + (getRTarget().posX - getRTarget().lastTickPosX) * mc.timer.renderPartialTicks - mc.getRenderManager().renderPosX,
    getRTarget().lastTickPosY + (getRTarget().posY - getRTarget().lastTickPosY) * mc.timer.renderPartialTicks - mc.getRenderManager().renderPosY+module.settings.F.get(),
    getRTarget().lastTickPosZ + (getRTarget().posZ - getRTarget().lastTickPosZ) * mc.timer.renderPartialTicks - mc.getRenderManager().renderPosZ
    )
    
    GL11.glEnable(GL11.GL_BLEND);
    GL11.glEnable(GL11.GL_LINE_SMOOTH);
    GL11.glDisable(GL11.GL_TEXTURE_2D);
    GL11.glDisable(GL11.GL_DEPTH_TEST);
    GL11.glBlendFunc(GL11.GL_SRC_ALPHA, GL11.GL_ONE_MINUS_SRC_ALPHA);
    
    GL11.glLineWidth(module.settings.L.get());
    RenderUtils.glColor(new Color(0, 255, 0, 255));
    GL11.glRotatef(90, 1, 0, 0);
    GL11.glBegin(GL11.GL_LINE_STRIP);
    
    for (i = 0; i <= 360; i += 10) {
        GL11.glVertex2f(Math.cos(i * Math.PI / 180) * 0.6, (Math.sin(i * Math.PI / 180) * 0.6));
    }
    
    GL11.glEnd();
    
    GL11.glDisable(GL11.GL_BLEND);
    GL11.glEnable(GL11.GL_TEXTURE_2D);
    GL11.glEnable(GL11.GL_DEPTH_TEST);
    GL11.glDisable(GL11.GL_LINE_SMOOTH);

    GL11.glPopMatrix();
    }
    });
});

//einfache Prozentrechnung
function toPercent(num, total) { 
    return (Math.round(num / total * 10000) / 100);
}

//funktion um den spielerkopf des nächstgelegenen spielers zu "zeichnen"
function drawFace (target, x, y) {
	mc.getTextureManager().bindTexture(target.getLocationSkin());
	GL11.glEnable(GL11.GL_BLEND); GL11.glColor4f(1, 1, 1, 1);
	Gui.drawScaledCustomSizeModalRect(x, y, 8, 8, 8, 8, 27, 27, 64, 64);
	GL11.glDisable(GL11.GL_BLEND);
}

//korrektur (wenn falsch) der prozentrechnung
function argCheck(num,min,max){
    if(num>max){
        return max;
    }
    if(num<min){
        return min;
    }
    return num;
}
