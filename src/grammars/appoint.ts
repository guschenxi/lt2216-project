export const grammar = `
<grammar root="final">
   <rule id="final">
      <tag>out = new Object(); </tag>
      <ruleref uri="#opening"/>
         <item repeat="1-3">
             <one-of>
                <item><ruleref uri="#person"/><tag>out.person = rules.person;</tag></item>
                <item><ruleref uri="#day"/><tag>out.day = rules.day;</tag></item>
                <item><ruleref uri="#time"/><tag>out.time = rules.time;</tag></item>
             </one-of>
         </item>
   </rule>
   <rule id="person">
      <item repeat="0-1">with</item>
      <one-of> 
         <item> David <tag> out = 'David Svensson'; </tag></item>
         <item> Monica <tag> out = 'Monica Johansson'; </tag></item>
         <item> Sven <tag> out = 'Sven Svala'; </tag></item>
         <item> Jack <tag> out = 'Jack Chen'; </tag></item>
      </one-of>
   </rule>
   <rule id="day">
      <item repeat="0-1">on</item><item repeat="0-1">the</item>
      <one-of> 
         <item> Monday <tag> out = 'Monday'; </tag></item>
         <item> Tuesday <tag> out = 'Tuesday'; </tag></item>
         <item> Wednesday <tag> out = 'Wednesday'; </tag></item>
         <item> Thursday <tag> out = 'Thursday'; </tag></item>
         <item> Friday <tag> out = 'Friday'; </tag></item>
         <item> Saturday <tag> out = 'Saturday'; </tag></item>
         <item> Sunday <tag> out = 'Sunday'; </tag></item>
      </one-of>
   </rule>
   <rule id="time">
      <tag> out.ampm = " "; </tag>
      <item repeat="0-1"> at </item>
      <one-of>
         <item><ruleref uri="#hour"/><tag>out.hour = rules.hour; out.minute = "00"</tag></item>
         <item><ruleref uri="#hour"/>:00<tag>out.hour = rules.hour; out.minute = "00"</tag></item>
         <item><ruleref uri="#hour"/>:<ruleref uri="#minute"/><tag>out.hour = rules.hour; out.minute = rules.minute;</tag></item>
         <item><ruleref uri="#minute"/><tag> out.minute = rules.minute; </tag> past <ruleref uri="#hour"/><tag>out.hour = rules.hour; </tag></item>
         <item><ruleref uri="#minute"/><tag> out.minute = 60 - rules.minute; </tag> to <ruleref uri="#hour"/><tag>out.hour = rules.hour - 1; </tag></item>
      </one-of>
      <item repeat="0-1"> o'clock </item>
      <item repeat="0-1">
          <one-of>
              <item>a.m.<tag> out.ampm = "a.m."; </tag></item>
              <item>p.m.<tag> out.ampm = "p.m."; </tag></item>
          </one-of>
       </item>
   </rule>
   <rule id="minute">
      <one-of>
         <item><item repeat = "1-2"><one-of><item>0</item><item>o</item></one-of></item> <tag> out = '00'; </tag></item>
         <item><item repeat = "0-1"><one-of><item>0</item><item>o</item></one-of></item>1 <tag> out = '01'; </tag></item>
         <item><item repeat = "0-1"><one-of><item>0</item><item>o</item></one-of></item>2 <tag> out = '02'; </tag></item>
         <item><item repeat = "0-1"><one-of><item>0</item><item>o</item></one-of></item>3 <tag> out = '03'; </tag></item>
         <item><item repeat = "0-1"><one-of><item>0</item><item>o</item></one-of></item>4 <tag> out = '04'; </tag></item>
         <item><item repeat = "0-1"><one-of><item>0</item><item>o</item></one-of></item>5 <tag> out = '05'; </tag></item>
         <item><item repeat = "0-1"><one-of><item>0</item><item>o</item></one-of></item>6 <tag> out = '06'; </tag></item>
         <item><item repeat = "0-1"><one-of><item>0</item><item>o</item></one-of></item>7 <tag> out = '07'; </tag></item>
         <item><item repeat = "0-1"><one-of><item>0</item><item>o</item></one-of></item>8 <tag> out = '08'; </tag></item>
         <item><item repeat = "0-1"><one-of><item>0</item><item>o</item></one-of></item>9 <tag> out = '09'; </tag></item>
         <item>10 <tag> out = '10'; </tag></item>
         <item>11<tag> out = '11'; </tag></item>
         <item>12 <tag> out = '12'; </tag></item>
         <item>13 <tag> out = '13'; </tag></item>
         <item>14 <tag> out = '14'; </tag></item>
         <item><one-of><item>15 </item><item><item repeat="0-1">a</item>quarter</item></one-of> <tag> out = '15'; </tag></item>
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
         <item><one-of><item>30 </item><item>half </item></one-of><tag> out = '30'; </tag></item>
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
         <item><item repeat = "0-1">zero</item> 1 <tag> out = '1'; </tag></item>
         <item><item repeat = "0-1">zero</item> 2 <tag> out = '2'; </tag></item>
         <item><item repeat = "0-1">zero</item> 3 <tag> out = '3'; </tag></item>
         <item><item repeat = "0-1">zero</item> 4 <tag> out = '4'; </tag></item>
         <item><item repeat = "0-1">zero</item> 5 <tag> out = '5'; </tag></item>
         <item><item repeat = "0-1">zero</item> 6 <tag> out = '6'; </tag></item>
         <item><item repeat = "0-1">zero</item> 7 <tag> out = '7'; </tag></item>
         <item><item repeat = "0-1">zero</item> 8 <tag> out = '8'; </tag></item>
         <item><item repeat = "0-1">zero</item> 9 <tag> out = '9'; </tag></item>
         <item>10 <tag> out = '10'; </tag></item>
         <item>11<tag> out = '11'; </tag></item>
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
  
   <rule id="opening">
      <item repeat="0-1">
         <one-of>
            <item>meeting</item>
            <item>meeting with</item>
            <item>create a meeting </item>
            <item>create an appointment</item>
            <item>appointment</item>
         </one-of>
      </item>
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
         <item> of course </item>
         <item> absolutely </item>
         <item> right </item>
         <item> that's right </item>
         <item> confirm </item>
      </one-of>
   </rule>
   <rule id="no">
      <tag> out = false; </tag>
      <one-of> 
         <item> no </item>
         <item> no way </item>
         <item> absolutely not </item>
         <item> no no </item>
      </one-of>
   </rule>
</grammar>
`
