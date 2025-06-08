document.addEventListener('DOMContentLoaded', function() {
    const startDateInput = document.getElementById('startDate');
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    startDateInput.value = formattedDate;
    console.log('startDate 설정값:', startDateInput.value); // 디버깅용
});

function updateLiquorName() {
    const customSteps = document.getElementById('customSteps');
    const liquorType = document.getElementById('liquorType');
    
    if (customSteps.value) {
        customSteps.value = '';
    }
}

function getLiquorSteps() {
    const customSteps = parseInt(document.getElementById('customSteps').value);
    const liquorType = parseInt(document.getElementById('liquorType').value);
    
    return customSteps || liquorType;
}

function getLiquorName(steps) {
    const names = {
        1: '단양주 (일양주)',
        2: '이양주',
        3: '삼양주', 
        4: '사양주',
        5: '오양주',
        6: '육양주',
        7: '칠양주',
        8: '팔양주',
        9: '구양주',
        10: '십양주'
    };
    
    if (steps <= 10) {
        return names[steps];
    } else {
        const koreanNumbers = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십',
                              '십일', '십이', '십삼', '십사', '십오', '십육', '십칠', '십팔', '십구', '이십'];
        if (steps <= 20) {
            return `${koreanNumbers[steps]}양주`;
        } else {
            return `${steps}양주`;
        }
    }
}

function calculateIngredients() {
    const liquorSteps = getLiquorSteps();
    const totalAmount = parseFloat(document.getElementById('totalAmount').value);
    let startDate = document.getElementById('startDate').value;
    const porridgeType = document.getElementById('porridgeType').value;

    // 슬래시를 하이픈으로 변환
    startDate = startDate.replace(/\//g, '-');

    // 날짜 형식이 유효한지 검증
    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        alert('올바른 날짜 형식을 선택해주세요 (yyyy-MM-dd).');
        return;
    }

    if (!liquorSteps || liquorSteps <= 0) {
        alert('올바른 술 종류를 선택하거나 덧술 횟수를 입력해주세요.');
        return;
    }
    
    if (!totalAmount || totalAmount <= 0) {
        alert('올바른 술 양을 입력해주세요.');
        return;
    }

    // 기본 계산 (총량의 50%씩 쌀과 물)
    const totalRice = totalAmount * 500; // g
    const totalWater = totalAmount * 500; // ml
    const totalNuruk = totalRice * 0.1; // 쌀의 10%

    let schedule = [];

    if (liquorSteps === 1) {
        // 단양주 - 한 번에 모든 재료 투입
        schedule.push({
            step: 1,
            stepName: '단양주 제조',
            date: startDate,
            rice: totalRice,
            water: totalWater,
            nuruk: totalNuruk,
            processing: '모든 재료를 한 번에 투입',
            note: '발효 시작 - 21-25도 유지'
        });
        
        // 채주일 추가
        const filterDate = addDays(startDate, 21); // 3주로 변경
        schedule.push({
            step: 2,
            stepName: '채주 (걸러내기)',
            date: filterDate,
            rice: 0,
            water: 0,
            nuruk: 0,
            processing: '술 걸러내기',
            note: '발효 완료 후 맑은 술 걸러내기'
        });
    } else {
        // 다양주 계산
        const steps = liquorSteps;
        const waterRatio = porridgeType === 'porridge' ? 5 : 3; // 죽(물:쌀가루=5:1) 또는 범벅(물:쌀가루=3:1)
        const stepInterval = 2; // 2일 간격
        
        // 마지막 단계는 고두밥(물 없음)이므로, 이전 단계들에서 모든 물을 사용
        const waterSteps = steps - 1; // 물을 넣는 단계 수
        const waterPerStep = totalWater / waterSteps; // 각 단계당 물의 양
        
        let totalUsedRice = 0; // 지금까지 사용한 쌀의 총량

        for (let i = 0; i < steps; i++) {
            const isLastStep = i === steps - 1;
            const stepDate = addDays(startDate, i * stepInterval);
            
            let stepName = '';
            if (i === 0) stepName = '밑술';
            else if (isLastStep) stepName = '덧술 (마지막)';
            else stepName = `${i + 1}차 덧술`;

            if (isLastStep) {
                // 마지막 단계는 고두밥 (물 추가 없음) - 남은 모든 쌀 사용
                const remainingRice = totalRice - totalUsedRice;
                
                schedule.push({
                    step: i + 1,
                    stepName: stepName,
                    date: stepDate,
                    rice: Math.round(remainingRice),
                    water: 0,
                    nuruk: 0,
                    processing: '찹쌀 고두밥',
                    note: '고두밥은 물 추가 없이, 찐 상태로 넣기'
                });
            } else {
                // 범벅 또는 죽으로 만드는 단계
                const stepWater = Math.round(waterPerStep);
                const stepNuruk = i === 0 ? totalNuruk : 0; // 누룩은 첫 번째만
                
                // 물:쌀가루 비율에 따라 쌀가루 양 계산
                const riceFlour = Math.round(stepWater / waterRatio);
                totalUsedRice += riceFlour;
                
                const processingMethod = porridgeType === 'porridge' ? 
                    `쌀가루 ${riceFlour}g으로 죽 만들기 (물:쌀가루 = 5:1)` :
                    `쌀가루 ${riceFlour}g으로 범벅 만들기 (물:쌀가루 = 3:1)`;
                
                schedule.push({
                    step: i + 1,
                    stepName: stepName,
                    date: stepDate,
                    rice: riceFlour,
                    water: stepWater,
                    nuruk: stepNuruk,
                    processing: processingMethod,
                    note: i === 0 ? 
                        '누룩은 첫 번째에만, 21-25도 유지' : 
                        '차게 식힌 후 투입 (48시간 간격)'
                });
            }
        }
        
        // 채주일 추가 (마지막 덧술 후 3주)
        const filterDate = addDays(startDate, (steps - 1) * stepInterval + 21); // 3주로 변경
        schedule.push({
            step: steps + 1,
            stepName: '채주 (걸러내기)',
            date: filterDate,
            rice: 0,
            water: 0,
            nuruk: 0,
            processing: '술 걸러내기',
            note: '발효 완료 후 맑은 술 걸러내기'
        });
    }

    displayResults(schedule, totalAmount, liquorSteps, totalRice, totalWater, totalNuruk);
}

function addDays(dateString, days) {
    // 슬래시를 하이픈으로 변환
    dateString = dateString.replace(/\//g, '-');
    const date = new Date(dateString);

    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateString}. Expected yyyy-MM-dd.`);
    }

    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}/${month}/${day} (${weekday})`;
}

function displayResults(schedule, totalAmount, liquorSteps, totalRice, totalWater, totalNuruk) {
    const resultsDiv = document.getElementById('results');
    const liquorName = getLiquorName(liquorSteps);
    
    let html = `
        <h3>📊 ${liquorName} 제조 계획</h3>
        
        <div class="summary-section">
            <h4>📋 전체 재료 요약</h4>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">목표 술 양</div>
                    <div class="summary-value">${totalAmount}L</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">총 쌀</div>
                    <div class="summary-value">${totalRice}g</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">총 물</div>
                    <div class="summary-value">${totalWater}ml</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">총 누룩</div>
                    <div class="summary-value">${totalNuruk}g</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">제조 기간</div>
                    <div class="summary-value">${calculateDuration(schedule)}일</div>
                </div>
            </div>
        </div>

        <div class="schedule-section">
            <h4>📅 제조 일정표 (48시간 간격)</h4>
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th>단계</th>
                        <th>날짜</th>
                        <th>쌀 (g)</th>
                        <th>물 (ml)</th>
                        <th>누룩 (g)</th>
                        <th>가공방법</th>
                        <th>비고</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // 총량 계산을 위한 변수
    let totalUsedRice = 0;
    let totalUsedWater = 0;
    let totalUsedNuruk = 0;

    schedule.forEach((step) => {
        const riceDisplay = step.rice > 0 ? step.rice : '-';
        const waterDisplay = step.water > 0 ? step.water : '-';
        const nurukDisplay = step.nuruk > 0 ? step.nuruk : '-';
        
        // 채주 단계가 아닌 경우에만 총량에 추가
        if (step.stepName !== '채주 (걸러내기)') {
            totalUsedRice += step.rice;
            totalUsedWater += step.water;
            totalUsedNuruk += step.nuruk;
        }
        
        html += `
            <tr>
                <td>
                    <span class="step-number">${step.step}</span>
                    ${step.stepName}
                </td>
                <td><strong>${formatDate(step.date)}</strong></td>
                <td>${riceDisplay}</td>
                <td>${waterDisplay}</td>
                <td>${nurukDisplay}</td>
                <td>${step.processing}</td>
                <td class="note-column">${step.note}</td>
            </tr>
        `;
    });

    // 총량 행 추가
    html += `
                    <tr style="background-color: #2ecc71; color: white; font-weight: bold;">
                        <td colspan="2">총량</td>
                        <td>${totalUsedRice}g</td>
                        <td>${totalUsedWater}ml</td>
                        <td>${totalUsedNuruk}g</td>
                        <td colspan="2">전체 사용량</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="tips-section">
            <h4>💡 제조 팁</h4>
            <ul class="tips-list">
                <li>덧술은 48시간(2일) 간격으로 진행합니다</li>
                <li>범벅/죽을 만들 때는 빠르고 신속하게 익혀야 합니다</li>
                <li>발효 온도는 21-25도를 유지해주세요</li>
                <li>덧술 타이밍을 놓치면 효모 활동이 약해질 수 있으니 주의하세요</li>
                <li>매일 2회 이상 바닥까지 골고루 저어주세요 (첫 2-3일)</li>
                <li>고두밥은 마지막에 넣고 물을 추가하지 않습니다</li>
                <li>채주 시기는 밥알이 표면에 얇게 떠있을 때입니다</li>
            </ul>
        </div>
    `;

    resultsDiv.innerHTML = html;
    resultsDiv.classList.add('show');
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

function calculateDuration(schedule) {
    const startDate = new Date(schedule[0].date);
    const endDate = new Date(schedule[schedule.length - 1].date);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}