export const grammar = `
<grammar root="final">
   <rule id="final">
      <tag> out = new Object();  </tag>
      <one-of>
         <item>
             <one-of>
               <item><ruleref uri="#time"/> <tag> out.time = rules.time; </tag></item>
               <item><ruleref uri="#date"/> <tag> out.date = rules.date; </tag></item>
               <item><ruleref uri="#from"/> <tag> out.from = rules.from; </tag></item>
               <item><ruleref uri="#to"/> <tag> out.to = rules.to; </tag></item>
             </one-of>
         </item>
         <item><tag>out.order = "asc";</tag>
            <ruleref uri="#QuestionWord"/><ruleref uri="#verb"/>
            <item repeat = "0-1">första</item><ruleref uri="#trainWord"/>
            <item repeat="0-4">
               <one-of>
                  <item><ruleref uri="#time"/> <tag> out.time = rules.time; </tag></item>
                  <item><ruleref uri="#date"/> <tag> out.date = rules.date; </tag></item>
                  <item><ruleref uri="#from"/> <tag> out.from = rules.from; </tag></item>
                  <item><ruleref uri="#to"/> <tag> out.to = rules.to; </tag></item>
                  <item><ruleref uri="#fromto"/><tag>out.from = rules.fromto.from; out.to = rules.fromto.to; </tag></item>
               </one-of>
            </item>
         </item>
         <item><tag>out.order = "asc";</tag>
            <ruleref uri="#QuestionWord"/><ruleref uri="#verb"/>
            <item>nästa</item><ruleref uri="#trainWord"/>
            <tag> out.time = 'NOW'; </tag><tag> out.date = 'today'; </tag>
            <item repeat="0-2"><one-of>
               <item><ruleref uri="#from"/> <tag> out.from = rules.from; </tag></item>
               <item><ruleref uri="#to"/> <tag> out.to = rules.to; </tag></item>
               <item><ruleref uri="#fromto"/><tag>out.from = rules.fromto.from; out.to = rules.fromto.to; </tag></item>
            </one-of></item>
         </item>
         <item>
            <ruleref uri="#QuestionWord"/><ruleref uri="#verb"/>
            <ruleref uri="#which"/><tag> out.time = rules.which.time; out.order = rules.which.order</tag>
            <ruleref uri="#trainWord"/>
            <item repeat="0-3"><one-of>
               <item><ruleref uri="#date"/> <tag> out.date = rules.date; </tag></item>
               <item><ruleref uri="#from"/> <tag> out.from = rules.from; </tag></item>
               <item><ruleref uri="#to"/> <tag> out.to = rules.to; </tag></item>
               <item><ruleref uri="#fromto"/><tag>out.from = rules.fromto.from; out.to = rules.fromto.to; </tag></item>
            </one-of></item>
         </item>
         
      </one-of>
   </rule>

   <rule id="trainWord">
      <item repeat = "0-1">
         <one-of>
            <item> tåg </item>
            <item> tåget </item>
            <item> tågen </item>
         </one-of>
      </item>
   </rule>

   <rule id="verb">
      <item repeat = "0-1">
         <one-of>
            <item> kör </item>
            <item> går </item>
            <item> är </item>
         </one-of>
      </item>
   </rule>

   <rule id="QuestionWord">
      <item repeat = "0-1">
         <one-of>
            <item> När </item>
            <item> Vilken tid </item>
            <item> Hur dags </item>
         </one-of>
      </item>
   </rule>

   <rule id="which">
      <one-of>
         <item><one-of><item> första </item><item> Första </item></one-of> <tag> out.time = '00:00'; out.order = "asc"; </tag></item>
         <item><one-of><item> sista </item><item> Sista </item></one-of><tag> out.time = '00:00'; out.order = "desc"; </tag></item>
         <item> det första <tag> out.time = '00:00'; out.order = "asc"; </tag></item>
         <item> det sista <tag> out.time = '00:00'; out.order = "desc"; </tag></item>
         <item> den första <tag> out.time = '00:00'; out.order = "asc"; </tag></item>
         <item> den sista <tag> out.time = '00:00'; out.order = "desc"; </tag></item>
         <item> de första <tag> out.time = '00:00'; out.order = "asc"; </tag></item>
         <item> de sista <tag> out.time = '00:00'; out.order = "desc"; </tag></item>
      </one-of>
   </rule>
   <rule id="fromto">
      <item repeat="0-1">från</item><ruleref uri="#station"/> <tag> out.from = rules.station; </tag>
      <item repeat="0-1"><one-of><item>till</item><item>mot</item></one-of></item>
      <ruleref uri="#station"/> <tag> out.to = rules.station; </tag>
   </rule>
   <rule id="from">
      <item>från</item><ruleref uri="#station"/> <tag> out = rules.station; </tag>
   </rule>
   <rule id="to">
      <one-of><item>till</item><item>mot</item></one-of>
      <ruleref uri="#station"/> <tag> out = rules.station; </tag>
   </rule>

   <rule id="station">
      <one-of>
         <item> Emmaboda <tag> out = 'Em'; </tag></item>
         <item> Kalmar <tag> out = 'Kac'; </tag></item>
         <item> Karlskrona <tag> out = 'Ck'; </tag></item>
         <item> Holmsjö <tag> out = 'Hmö'; </tag></item>
         <item> Bergåsa <tag> out = 'Båa'; </tag></item>
         <item> Vissefjärda <tag> out = 'Vfa'; </tag></item>
         <item> Örsjö <tag> out = 'Örs'; </tag></item>
         <item> Nybro <tag> out = 'Nyb'; </tag></item>
         <item> Trekanten <tag> out = 'Tre'; </tag></item>
         <item> Smedby <tag> out = 'Sdy'; </tag></item>
         <item> Malmö <tag> out = 'M'; </tag></item>
         <item> Växjö <tag> out = 'Vö'; </tag></item>
         <item> Hässleholm <tag> out = 'Hm'; </tag></item>
         <item> Hovmantorp <tag> out = 'Hvp'; </tag></item>
         <item> Lessebo <tag> out = 'Lo'; </tag></item>
         <item> Göteborg <tag> out = 'G'; </tag></item>
         <item> Alvesta <tag> out = 'Av'; </tag></item>
         <item> Stockholm <tag> out = 'Cst'; </tag></item>
      </one-of>
      <item repeat = "0-1">
          <one-of>
             <item>station</item> <item>Station</item>
             <item>centralstation</item> <item>Centralstation</item>
             <item>C</item> <item>c</item> <item>central</item>
             <item>stationen</item> <item>Stationen</item>
             <item>centralstationen</item> <item>Centralstationen</item>
          </one-of>
      </item>
   </rule>

   <rule id="time">
	   <item repeat="0-1"> efter </item> <item repeat="0-1"> klockan </item>
	   <one-of>
	     <item> nu <tag> out = "NOW"; </tag></item>
	     <item> now <tag> out = "NOW"; </tag></item>
		 <item><ruleref uri="#hour"/><tag>out = rules.hour+":00"</tag></item>
		 <item><ruleref uri="#hour"/>.<ruleref uri="#minute"/><tag>out = rules.hour+":"+rules.minute;</tag></item>
		 <item><ruleref uri="#hour"/>och<ruleref uri="#minute"/><tag>out.hour = rules.hour; out.minute = rules.minute;</tag></item>
		 <item><ruleref uri="#minute"/> över <ruleref uri="#hour"/><tag>out = rules.hour+":"+rules.minute; </tag></item>
		 <item><ruleref uri="#minute"/> i <ruleref uri="#hour"/><tag>out = ("0"+(rules.hour - 1)).slice(-2)+":"+("0"+(60 - rules.minute)).slice(-2); </tag></item>
		 <item> halv <ruleref uri="#hour"/><tag>out = ("0"+(rules.hour-1)).slice(-2) +":30"; </tag></item>
		 <item> kvart i <ruleref uri="#hour"/><tag>out = ("0"+(rules.hour-1)).slice(-2) +":45"; </tag></item>
		 <item> kvart över <ruleref uri="#hour"/><tag>out = ("0"+rules.hour).slice(-2) +":15"; </tag></item>
	  </one-of>
   </rule>
   
   <rule id="minute">
      <one-of>
         <item><one-of><item>00</item><item>0</item><item>noll</item></one-of> <tag> out = '00'; </tag></item>
         <item><one-of><item>01</item><item>1</item><item>ett</item></one-of> <tag> out = '01'; </tag></item>
         <item><one-of><item>02</item><item>2</item><item>två</item></one-of> <tag> out = '02'; </tag></item>
         <item><one-of><item>03</item><item>3</item><item>tre</item></one-of> <tag> out = '03'; </tag></item>
         <item><one-of><item>04</item><item>4</item><item>fyra</item></one-of> <tag> out = '04'; </tag></item>
         <item><one-of><item>05</item><item>5</item><item>fem</item></one-of> <tag> out = '05'; </tag></item>
         <item><one-of><item>06</item><item>6</item><item>sex</item></one-of> <tag> out = '06'; </tag></item>
         <item><one-of><item>07</item><item>7</item><item>sju</item></one-of> <tag> out = '07'; </tag></item>
         <item><one-of><item>08</item><item>8</item><item>åtta</item></one-of> <tag> out = '08'; </tag></item>
         <item><one-of><item>09</item><item>9</item><item>nio</item></one-of> <tag> out = '09'; </tag></item>
         <item><one-of><item>10</item><item>tio</item></one-of><tag> out = '10'; </tag></item>
         <item>11 <tag> out = '11'; </tag></item>
         <item>12 <tag> out = '12'; </tag></item>
         <item>13 <tag> out = '13'; </tag></item>
         <item>14 <tag> out = '14'; </tag></item>
         <item>15 <tag> out = '15'; </tag></item>
         <item>16 <tag> out = '16'; </tag></item>
         <item>17 <tag> out = '17'; </tag></item>
         <item>18 <tag> out = '18'; </tag></item>
         <item>19 <tag> out = '19'; </tag></item>
         <item>20 <tag> out = '20'; </tag></item>
         <item>21 <tag> out = '21'; </tag></item>
         <item>22 <tag> out = '22'; </tag></item>
         <item>23 <tag> out = '23'; </tag></item>
         <item>24 <tag> out = '24'; </tag></item>
         <item>25 <tag> out = '25'; </tag></item>
         <item>26 <tag> out = '26'; </tag></item>
         <item>27 <tag> out = '27'; </tag></item>
         <item>28 <tag> out = '28'; </tag></item>
         <item>29 <tag> out = '29'; </tag></item>
         <item>30 <tag> out = '30'; </tag></item>
         <item>31 <tag> out = '31'; </tag></item>
         <item>32 <tag> out = '32'; </tag></item>
         <item>33 <tag> out = '33'; </tag></item>
         <item>34 <tag> out = '34'; </tag></item>
         <item>35 <tag> out = '35'; </tag></item>
         <item>36 <tag> out = '36'; </tag></item>
         <item>37 <tag> out = '37'; </tag></item>
         <item>38 <tag> out = '38'; </tag></item>
         <item>39 <tag> out = '39'; </tag></item>
         <item>40 <tag> out = '40'; </tag></item>
         <item>41 <tag> out = '41'; </tag></item>
         <item>42 <tag> out = '42'; </tag></item>
         <item>43 <tag> out = '43'; </tag></item>
         <item>44 <tag> out = '44'; </tag></item>
         <item>45 <tag> out = '45'; </tag></item>
         <item>46 <tag> out = '46'; </tag></item>
         <item>47 <tag> out = '47'; </tag></item>
         <item>48 <tag> out = '48'; </tag></item>
         <item>49 <tag> out = '49'; </tag></item>
         <item>50 <tag> out = '50'; </tag></item>
         <item>51 <tag> out = '51'; </tag></item>
         <item>52 <tag> out = '52'; </tag></item>
         <item>53 <tag> out = '53'; </tag></item>
         <item>54 <tag> out = '54'; </tag></item>
         <item>55 <tag> out = '55'; </tag></item>
         <item>56 <tag> out = '56'; </tag></item>
         <item>57 <tag> out = '57'; </tag></item>
         <item>58 <tag> out = '58'; </tag></item>
         <item>59 <tag> out = '59'; </tag></item>
         <item>60 <tag> out = '60'; </tag></item>
      </one-of>
   </rule>
   <rule id="hour">
      <one-of>
         <item><one-of><item>00</item><item>0</item><item>noll</item></one-of> <tag> out = '01'; </tag></item>
         <item><one-of><item>01</item><item>1</item><item>ett</item></one-of> <tag> out = '01'; </tag></item>
         <item><one-of><item>02</item><item>2</item><item>två</item></one-of> <tag> out = '02'; </tag></item>
         <item><one-of><item>03</item><item>3</item><item>tre</item></one-of> <tag> out = '03'; </tag></item>
         <item><one-of><item>04</item><item>4</item><item>fyra</item></one-of> <tag> out = '04'; </tag></item>
         <item><one-of><item>05</item><item>5</item><item>fem</item></one-of> <tag> out = '05'; </tag></item>
         <item><one-of><item>06</item><item>6</item><item>sex</item></one-of> <tag> out = '06'; </tag></item>
         <item><one-of><item>07</item><item>7</item><item>sju</item></one-of> <tag> out = '07'; </tag></item>
         <item><one-of><item>08</item><item>8</item><item>åtta</item></one-of> <tag> out = '08'; </tag></item>
         <item><one-of><item>09</item><item>9</item><item>nio</item></one-of> <tag> out = '09'; </tag></item>
         <item><one-of><item>10</item><item>tio</item></one-of><tag> out = '10'; </tag></item>
         <item>11 <tag> out = '11'; </tag></item>
         <item>12 <tag> out = '12'; </tag></item>
         <item>13 <tag> out = '13'; </tag></item>
         <item>14 <tag> out = '14'; </tag></item>
         <item>15 <tag> out = '15'; </tag></item>
         <item>16 <tag> out = '16'; </tag></item>
         <item>17 <tag> out = '17'; </tag></item>
         <item>18 <tag> out = '18'; </tag></item>
         <item>19 <tag> out = '19'; </tag></item>
         <item>20 <tag> out = '20'; </tag></item>
         <item>21 <tag> out = '21'; </tag></item>
         <item>22 <tag> out = '22'; </tag></item>
         <item>23 <tag> out = '23'; </tag></item>
         <item>24 <tag> out = '24'; </tag></item>
      </one-of>
   </rule>

   <rule id="date">
         <one-of>
            <item> idag <tag> out = 'today'; </tag></item>
            <item> imorgon <tag> out = 'tomorrow'; </tag></item>
            <item> today <tag> out = 'today'; </tag></item>
            <item> tomorrow <tag> out = 'tomorrow'; </tag></item>
            <item> 
               <item repeat="0-1"> den </item><ruleref uri="#day"/><ruleref uri="#month"/>
               <tag> out = '2021-'+ rules.month + '-' + rules.day ; </tag>
            </item>
         </one-of>
   </rule>

   <rule id="day">
      <one-of>
         <item><one-of><item>01</item><item>1</item></one-of> <tag> out = '01'; </tag></item>
         <item><one-of><item>02</item><item>2</item></one-of> <tag> out = '02'; </tag></item>
         <item><one-of><item>03</item><item>3</item></one-of> <tag> out = '03'; </tag></item>
         <item><one-of><item>04</item><item>4</item></one-of> <tag> out = '04'; </tag></item>
         <item><one-of><item>05</item><item>5</item></one-of> <tag> out = '05'; </tag></item>
         <item><one-of><item>06</item><item>6</item></one-of> <tag> out = '06'; </tag></item>
         <item><one-of><item>07</item><item>7</item></one-of> <tag> out = '07'; </tag></item>
         <item><one-of><item>08</item><item>8</item></one-of> <tag> out = '08'; </tag></item>
         <item><one-of><item>09</item><item>9</item></one-of> <tag> out = '09'; </tag></item>
         <item>10 <tag> out = '10'; </tag></item>
         <item>11 <tag> out = '11'; </tag></item>
         <item>12 <tag> out = '12'; </tag></item>
         <item>13 <tag> out = '13'; </tag></item>
         <item>14 <tag> out = '14'; </tag></item>
         <item>15 <tag> out = '15'; </tag></item>
         <item>16 <tag> out = '16'; </tag></item>
         <item>17 <tag> out = '17'; </tag></item>
         <item>18 <tag> out = '18'; </tag></item>
         <item>19 <tag> out = '19'; </tag></item>
         <item>20 <tag> out = '20'; </tag></item>
         <item>21 <tag> out = '21'; </tag></item>
         <item>22 <tag> out = '22'; </tag></item>
         <item>23 <tag> out = '23'; </tag></item>
         <item>24 <tag> out = '24'; </tag></item>
         <item>25 <tag> out = '25'; </tag></item>
         <item>26 <tag> out = '26'; </tag></item>
         <item>27 <tag> out = '27'; </tag></item>
         <item>28 <tag> out = '28'; </tag></item>
         <item>29 <tag> out = '29'; </tag></item>
         <item>30 <tag> out = '30'; </tag></item>
         <item>31 <tag> out = '31'; </tag></item>
      </one-of>
   </rule>

   <rule id="month">
      <one-of>
         <item><one-of><item>Januari</item><item>januari</item></one-of><tag> out = '01'; </tag></item>
         <item><one-of><item>Februari</item><item>februari</item></one-of><tag> out = '02'; </tag></item>
         <item><one-of><item>Mars</item><item>mars</item></one-of><tag> out = '03'; </tag></item>
         <item><one-of><item>April</item><item>april</item></one-of><tag> out = '04'; </tag></item>
         <item><one-of><item>Maj</item><item>maj</item></one-of><tag> out = '05'; </tag></item>
         <item><one-of><item>Juni</item><item>juni</item></one-of><tag> out = '06'; </tag></item>
         <item><one-of><item>Juli</item><item>juli</item></one-of><tag> out = '07'; </tag></item>
         <item><one-of><item>Augusti</item><item>augusti</item></one-of><tag> out = '08'; </tag></item>
         <item><one-of><item>September</item><item>september</item></one-of><tag> out = '09'; </tag></item>
         <item><one-of><item>Oktober</item><item>oktober</item></one-of><tag> out = '10'; </tag></item>
         <item><one-of><item>November</item><item>november</item></one-of><tag> out = '11'; </tag></item>
         <item><one-of><item>December</item><item>december</item></one-of><tag> out = '12'; </tag></item>
      </one-of>
   </rule>
</grammar>
`

export const yesnogrammar = `
<grammar root="final">
   <rule id="final">
         <tag>out = new Object();</tag>
         <item repeat="1-2">
             <one-of>
                <item><ruleref uri="#yes"/><tag>out.yesnoanswer = rules.yes;</tag></item>
                <item><ruleref uri="#no"/><tag>out.yesnoanswer = rules.no;</tag></item>
             </one-of>
         </item>
   </rule>
   <rule id="yes">
      <tag> out = true; </tag>
      <one-of> 
         <item> yes </item>
         <item> ja </item>
         <item> absolut </item>
         <item> korrekt </item>
         <item> jajamen </item>
         <item> Ja visst </item>
      </one-of>
   </rule>
   <rule id="no">
      <tag> out = false; </tag>
      <one-of> 
         <item> no </item>
         <item> nej </item>
         <item> nix </item>
         <item> inte </item>
      </one-of>
   </rule>
</grammar>
`
